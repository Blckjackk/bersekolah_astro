"use client"

import React, { useState, useEffect } from "react";
import { 
  Search, 
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Trash2,
  MoreHorizontal,
  GraduationCap,
  FileEdit,
  Download
} from "lucide-react";

// Import komponen UI
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

// Import services
import { ApplicantService, type Applicant } from "../../lib/applicant-service";

// Types - menggunakan Applicant dari service
type BeswanListItem = Applicant;
type BeswanDetail = Applicant;

export default function PendaftarBeasiswaPage() {
  // State for data
  const [applicants, setApplicants] = useState<BeswanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>(undefined);
  
  // Dialog states
  const [detailDialog, setDetailDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedBeswan, setSelectedBeswan] = useState<BeswanDetail | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  
  // Toast notification state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success"
  });

  // Computed values
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = !searchTerm || 
      applicant.personalData.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.personalData.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || applicant.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchPeriods();
    fetchApplicants();
  }, []);

  // Fetch periods data
  const fetchPeriods = async () => {
    try {
      const data = await ApplicantService.getBeasiswaPeriods();
      setPeriods(data);
    } catch (err) {
      console.error("Error fetching periods:", err);
      showToast("Gagal memuat data periode", "error");
    }
  };

  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // Fetch applicants data
  const fetchApplicants = async (periodId?: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Gunakan getBeswanList yang sesuai dengan API Laravel
      const data = await ApplicantService.getBeswanList(periodId);
      console.log('Fetched applicant data:', data);
      
      // Debug specific data untuk alamat dan pendidikan
      if (data.length > 0) {
        console.log('Sample alamat data:', data[0].alamat);
        console.log('Sample sekolah data:', data[0].sekolah);
      }
      
      // Transform data dari struktur Laravel ke struktur yang diharapkan komponen
      const transformedData: BeswanListItem[] = data.map(beswan => {
        console.log('Processing beswan:', beswan.id, {
          alamat: beswan.alamat,
          sekolah: beswan.sekolah
        });
        
        return {
        id: beswan.id?.toString() || "0",
        status: "Pending" as const, // Default status, bisa disesuaikan dengan field dari API
        applicationDate: beswan.created_at || new Date().toISOString(),
        applicationDetails: {
          program: "Beasiswa Pendidikan", // Default atau dari API
          batch: "2024", // Default atau dari API
          currentStage: "Review Dokumen",
          stages: []
        },
        personalData: {
          fullName: beswan.user?.name || "",
          nickname: beswan.nama_panggilan || "",
          birthDate: beswan.tanggal_lahir || "",
          address: beswan.tempat_lahir || "",
          gender: beswan.jenis_kelamin || "",
          school: (beswan.sekolah as any)?.asal_sekolah || "",
          religion: beswan.agama || "",
          childNumber: beswan.keluarga?.anak_ke || 1,
          totalSiblings: beswan.keluarga?.jumlah_saudara || 1,
          whatsapp: beswan.user?.email || ""
        },
        familyData: {
          fatherName: beswan.keluarga?.nama_ayah || "",
          fatherJob: beswan.keluarga?.pekerjaan_ayah || "",
          fatherIncome: beswan.keluarga?.penghasilan_ayah || "",
          motherName: beswan.keluarga?.nama_ibu || "",
          motherJob: beswan.keluarga?.pekerjaan_ibu || "",
          motherIncome: beswan.keluarga?.penghasilan_ibu || ""
        },
        addressData: beswan.alamat ? {
          fullAddress: beswan.alamat.alamat_lengkap || "",
          rt: (beswan.alamat as any).rt || "",
          rw: (beswan.alamat as any).rw || "",
          village: (beswan.alamat as any).kelurahan_desa || "",
          district: (beswan.alamat as any).kecamatan || "",
          city: (beswan.alamat as any).kota_kabupaten || "",
          province: beswan.alamat.provinsi || "",
          postalCode: beswan.alamat.kode_pos || "",
          phone: (beswan.alamat as any).nomor_telepon || "",
          emergencyContact: (beswan.alamat as any).kontak_darurat || ""
        } : undefined,
        educationData: beswan.sekolah ? {
          schoolName: (beswan.sekolah as any).asal_sekolah || "",
          schoolRegion: (beswan.sekolah as any).daerah_sekolah || "",
          major: beswan.sekolah.jurusan || "",
          level: (beswan.sekolah as any).tingkat_kelas || ""
        } : undefined,
        documents: [],
        essays: []
        };
      });

      setApplicants(transformedData);
      updateStats(transformedData);
      
      if (isRefresh) {
        showToast("Data berhasil diperbarui", "success");
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("Gagal memuat data pendaftar beasiswa");
      showToast("Gagal memuat data pendaftar beasiswa", "error");
      
      // Fallback ke empty array jika API gagal
      setApplicants([]);
      updateStats([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Update dashboard stats
  const updateStats = (applicants: BeswanListItem[]) => {
    const total = applicants.length;
    setStats({
      total,
      pending: Math.round(total * 0.3),
      accepted: Math.round(total * 0.5),
      rejected: Math.round(total * 0.2)
    });
  };

  // Handle period change
  const handlePeriodChange = (value: string) => {
    const periodId = value === "all" ? undefined : parseInt(value);
    setSelectedPeriodId(periodId);
    fetchApplicants(periodId);
  };

  // Handle detail click
  const handleDetailClick = async (applicant: BeswanListItem) => {
    try {
      setSelectedBeswan(null);
      setDetailDialog(true);
      
      // Gunakan getBeswan untuk mengambil detail dari API Laravel
      const beswanId = parseInt(applicant.id);
      const detailData = await ApplicantService.getBeswan(beswanId);
      
      // Transform detail data ke struktur yang diharapkan
      const transformedDetail: BeswanListItem = {
        id: detailData.id?.toString() || "0",
        status: "Pending" as const,
        applicationDate: detailData.created_at || new Date().toISOString(),
        applicationDetails: {
          program: "Beasiswa Pendidikan",
          batch: "2024",
          currentStage: "Review Dokumen",
          stages: []
        },
        personalData: {
          fullName: detailData.user?.name || "",
          nickname: detailData.nama_panggilan || "",
          birthDate: detailData.tanggal_lahir || "",
          address: detailData.tempat_lahir || "",
          gender: detailData.jenis_kelamin || "",
          school: (detailData.sekolah as any)?.asal_sekolah || "",
          religion: detailData.agama || "",
          childNumber: detailData.keluarga?.anak_ke || 1,
          totalSiblings: detailData.keluarga?.jumlah_saudara || 1,
          whatsapp: detailData.user?.email || ""
        },
        familyData: {
          fatherName: detailData.keluarga?.nama_ayah || "",
          fatherJob: detailData.keluarga?.pekerjaan_ayah || "",
          fatherIncome: detailData.keluarga?.penghasilan_ayah || "",
          motherName: detailData.keluarga?.nama_ibu || "",
          motherJob: detailData.keluarga?.pekerjaan_ibu || "",
          motherIncome: detailData.keluarga?.penghasilan_ibu || ""
        },
        addressData: detailData.alamat ? {
          fullAddress: detailData.alamat.alamat_lengkap || "",
          rt: (detailData.alamat as any).rt || "",
          rw: (detailData.alamat as any).rw || "",
          village: (detailData.alamat as any).kelurahan_desa || "",
          district: (detailData.alamat as any).kecamatan || "",
          city: (detailData.alamat as any).kota_kabupaten || "",
          province: detailData.alamat.provinsi || "",
          postalCode: detailData.alamat.kode_pos || "",
          phone: (detailData.alamat as any).nomor_telepon || "",
          emergencyContact: (detailData.alamat as any).kontak_darurat || ""
        } : undefined,
        educationData: detailData.sekolah ? {
          schoolName: (detailData.sekolah as any).asal_sekolah || "",
          schoolRegion: (detailData.sekolah as any).daerah_sekolah || "",
          major: detailData.sekolah.jurusan || "",
          level: (detailData.sekolah as any).tingkat_kelas || ""
        } : undefined,
        documents: [],
        essays: []
      };
      
      setSelectedBeswan(transformedDetail);
      
      // Debug log untuk modal detail
      console.log('handleViewDetail - detailData from API:', {
        id: detailData.id,
        alamat: detailData.alamat,
        sekolah: detailData.sekolah
      });
      console.log('handleViewDetail - transformedDetail:', {
        id: transformedDetail.id,
        addressData: transformedDetail.addressData,
        educationData: transformedDetail.educationData,
        fullDetail: transformedDetail
      });
    } catch (err) {
      console.error("Error fetching applicant detail:", err);
      showToast("Gagal memuat detail pendaftar", "error");
      setDetailDialog(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (applicant: BeswanListItem) => {
    setSelectedBeswan(applicant);
    setDeleteDialog(true);
  };

  // Handle delete confirm
  const handleDeleteBeswan = async () => {
    if (!selectedBeswan) return;
    
    try {
      // Gunakan deleteBeswan untuk menghapus data dari API Laravel
      const beswanId = parseInt(selectedBeswan.id);
      await ApplicantService.deleteBeswan(beswanId);
      
      // Remove from local state
      setApplicants(prev => prev.filter(item => item.id !== selectedBeswan.id));
      updateStats(applicants.filter(item => item.id !== selectedBeswan.id));
      
      showToast("Data pendaftar berhasil dihapus", "success");
      setDeleteDialog(false);
      setSelectedBeswan(null);
    } catch (err) {
      console.error("Error deleting applicant:", err);
      showToast("Gagal menghapus data pendaftar", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white transition-all duration-300`}>
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Kelola dan pantau data pendaftar beasiswa</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriodId?.toString() || "all"} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px] sm:w-[220px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  {period.tahun} - {period.nama_periode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => fetchApplicants(selectedPeriodId, true)} 
            variant="outline" 
            size="sm" 
            disabled={isRefreshing}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-[#406386] to-[#406386]/90">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">Total Pendaftar</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Menunggu Review</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Loader2 className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Diterima</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.accepted}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ditolak</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

      {/* Search and filter */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5" /> 
            Daftar Pendaftar Beasiswa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Review</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Memuat data...</span>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada pendaftar"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? `Tidak ditemukan pendaftar dengan kata kunci "${searchTerm}"`
                      : "Belum ada data pendaftar beasiswa untuk periode ini"
                    }
                  </p>
                </div>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Hapus Pencarian
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-700 uppercase">
                      ID
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-700 uppercase">
                      Informasi Pendaftar
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-700 uppercase">
                      Detail Pribadi
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-700 uppercase">
                      Tempat, Tanggal Lahir
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-700 uppercase">
                      Tanggal Daftar
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {filteredApplicants.map((applicant, index) => {
                    const tempatLahir = applicant.personalData.address || '-';
                    const tanggalLahir = applicant.personalData.birthDate ? formatDate(applicant.personalData.birthDate) : '-';
                    const ttl = `${tempatLahir}, ${tanggalLahir}`;
                    
                    return (
                      <TableRow key={applicant.id} className="transition-colors hover:bg-gray-50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                              {index + 1}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#406386] to-[#406386]/80 rounded-full">
                                <span className="text-sm font-medium text-white">
                                  {(applicant.personalData.fullName || applicant.personalData.nickname || 'N')[0].toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {applicant.personalData.fullName || '-'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {applicant.personalData.whatsapp || '-'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">Panggilan:</span> {applicant.personalData.nickname || '-'}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Gender:</span> {applicant.personalData.gender || '-'} • 
                              <span className="ml-2 font-medium">Agama:</span> {applicant.personalData.religion || '-'}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <p className="text-sm text-gray-900">{ttl}</p>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <p className="text-sm text-gray-900">{formatDate(applicant.applicationDate)}</p>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="w-8 h-8 p-0 hover:bg-gray-100"
                              >
                                <span className="sr-only">Menu aksi</span>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={() => handleDetailClick(applicant)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(applicant)} 
                                className="flex items-center gap-2 text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                Hapus Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-[#406386]/10 rounded-full">
                <Eye className="w-5 h-5 text-[#406386]" />
              </div>
              Detail Pendaftar Beasiswa
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Informasi lengkap tentang data pendaftar beasiswa
            </DialogDescription>
          </DialogHeader>
          
          {selectedBeswan ? (
            <div className="py-4 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center p-6 space-y-4 rounded-xl sm:flex-row sm:space-y-0 sm:space-x-6 bg-gradient-to-r from-[#406386]/5 to-[#406386]/10">
                <div className="flex items-center justify-center w-20 h-20 overflow-hidden bg-gradient-to-br from-[#406386] to-[#406386]/80 rounded-full shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {(selectedBeswan.personalData.fullName || selectedBeswan.personalData.nickname || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBeswan.personalData.fullName || 'Tidak ada nama'}</h3>
                  <p className="text-gray-600">{selectedBeswan.personalData.whatsapp || 'Tidak ada kontak'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>ID: {selectedBeswan.id}</span>
                    <span>•</span>
                    <span>Terdaftar: {formatDate(selectedBeswan.applicationDate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Data Pribadi */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                      <div className="w-2 h-2 bg-[#406386] rounded-full"></div>
                      Data Pribadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Nama Lengkap</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.personalData.fullName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Nama Panggilan</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.personalData.nickname || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">WhatsApp</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.personalData.whatsapp || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Jenis Kelamin</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.personalData.gender || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Agama</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.personalData.religion || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Anak ke-</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.personalData.childNumber || '-'} dari {selectedBeswan.personalData.totalSiblings || '-'} bersaudara</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Tempat, Tanggal Lahir</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedBeswan.personalData.address || '-'}, {selectedBeswan.personalData.birthDate ? formatDate(selectedBeswan.personalData.birthDate) : '-'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Data Pendidikan */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                      <div className="w-2 h-2 bg-[#406386] rounded-full"></div>
                      Data Pendidikan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Nama Sekolah/Perguruan Tinggi</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.educationData?.schoolName || selectedBeswan.personalData.school || 'Belum diisi'}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Jenjang</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.educationData?.level || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Jurusan</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.educationData?.major || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Daerah Sekolah</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.educationData?.schoolRegion || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Keluarga */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                      <div className="w-2 h-2 bg-[#406386] rounded-full"></div>
                      Data Keluarga
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Data Ayah */}
                      <div className="space-y-4">
                        <h4 className="pb-2 font-medium text-gray-800 border-b border-gray-200">Data Ayah</h4>
                        <div>
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Nama Ayah</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.familyData.fatherName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Pekerjaan Ayah</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.familyData.fatherJob || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Penghasilan Ayah</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.familyData.fatherIncome || '-'}</p>
                        </div>
                      </div>
                      
                      {/* Data Ibu */}
                      <div className="space-y-4">
                        <h4 className="pb-2 font-medium text-gray-800 border-b border-gray-200">Data Ibu</h4>
                        <div>
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Nama Ibu</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.familyData.motherName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Pekerjaan Ibu</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.familyData.motherJob || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Penghasilan Ibu</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.familyData.motherIncome || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Alamat */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                      <div className="w-2 h-2 bg-[#406386] rounded-full"></div>
                      Data Alamat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Alamat Lengkap</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.fullAddress || '-'}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">RT</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.rt || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">RW</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.rw || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Kelurahan/Desa</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.village || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Kecamatan</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.district || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Kota/Kabupaten</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.city || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Provinsi</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.province || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Kode Pos</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.postalCode || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Nomor Telepon</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Kontak Darurat</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.addressData?.emergencyContact || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#406386]" />
                <p className="text-sm text-gray-600">Memuat detail pendaftar...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl text-gray-900">Hapus Data Pendaftar</DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Tindakan ini tidak dapat dibatalkan. Data pendaftar akan dihapus secara permanen dari sistem.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedBeswan && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                    <span className="text-sm font-medium text-red-700">
                      {(selectedBeswan.personalData.fullName || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedBeswan.personalData.fullName || 'Nama tidak tersedia'}</p>
                    <p className="text-sm text-gray-600">{selectedBeswan.personalData.whatsapp || 'Kontak tidak tersedia'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBeswan}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}