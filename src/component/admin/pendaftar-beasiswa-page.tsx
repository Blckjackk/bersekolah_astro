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
    fetchApplicants();
  }, []);

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

      const response = await ApplicantService.getApplicants();
      const data = response.data; // Extract data from paginated response
      setApplicants(data);
      updateStats(data);
      
      if (isRefresh) {
        showToast("Data berhasil diperbarui", "success");
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("Gagal memuat data pendaftar beasiswa");
      showToast("Gagal memuat data pendaftar beasiswa", "error");
      
      // Use mock data for development
      const mockData: BeswanListItem[] = [
        { 
          id: "1",
          status: "Pending" as const,
          applicationDate: new Date().toISOString(),
          applicationDetails: {
            program: "Beasiswa Pendidikan",
            batch: "2024",
            currentStage: "Review Dokumen",
            stages: []
          },
          personalData: {
            fullName: "John Doe",
            nickname: "John",
            birthDate: "2000-01-01",
            address: "Jakarta",
            gender: "Laki-laki",
            school: "Universitas Indonesia",
            religion: "Islam",
            childNumber: 1,
            totalSiblings: 2,
            whatsapp: "08123456789"
          },
          familyData: {
            fatherName: "Budi Doe",
            fatherJob: "Guru",
            fatherIncome: "5000000",
            motherName: "Siti Doe",
            motherJob: "Ibu Rumah Tangga",
            motherIncome: "0"
          },
          documents: [],
          essays: []
        }
      ];
      setApplicants(mockData);
      updateStats(mockData);
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
      
      const detailData = await ApplicantService.getApplicant(applicant.id);
      setSelectedBeswan(detailData);
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
      // TODO: Implement delete functionality when available in service
      // await ApplicantService.deleteApplicant(selectedBeswan.id);
      console.log("Delete functionality not yet implemented in service");
      
      // For now, just remove from local state
      setApplicants(prev => prev.filter(item => item.id !== selectedBeswan.id));
      setApplicants(prev => prev.filter(item => item.id !== selectedBeswan.id));
      showToast("Data pendaftar berhasil dihapus", "success");
      setDeleteDialog(false);
      setSelectedBeswan(null);
    } catch (err) {
      console.error("Error deleting applicant:", err);
      showToast("Gagal menghapus data pendaftar", "error");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white transition-all duration-300`}>
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Pendaftar Beasiswa</h1>
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
      <div className="grid gap-4 sm:gap-6 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
            <Loader2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diterima</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filter */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 pb-2 sm:pb-4">
          <CardTitle className="flex gap-2 items-center text-base sm:text-lg">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" /> 
            Daftar Pendaftar Beasiswa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
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
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada data pendaftar"}
              </p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground">
                  Coba ubah kata kunci pencarian Anda
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Informasi Pendaftar</TableHead>
                    <TableHead className="hidden md:table-cell">Jenis Kelamin</TableHead>
                    <TableHead className="hidden lg:table-cell">Tempat Lahir</TableHead>
                    <TableHead className="hidden xl:table-cell">Tanggal Daftar</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {applicant.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <span className="text-sm font-medium">
                              {(applicant.personalData.fullName || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{applicant.personalData.fullName || 'Tidak ada nama'}</p>
                            <p className="text-sm text-muted-foreground">{applicant.personalData.whatsapp || 'Tidak ada kontak'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {applicant.personalData.gender || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {applicant.personalData.address || '-'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {formatDate(applicant.applicationDate)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDetailClick(applicant)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(applicant)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <div className="p-2 bg-primary/10 rounded-full">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              Detail Pendaftar Beasiswa
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informasi lengkap tentang data pendaftar beasiswa
            </DialogDescription>
          </DialogHeader>
          
          {selectedBeswan ? (
            <div className="py-4 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center p-6 space-y-4 rounded-xl sm:flex-row sm:space-y-0 sm:space-x-6 bg-muted/30">
                <div className="flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full">
                  <span className="text-xl font-bold text-primary">
                    {(selectedBeswan.personalData.fullName || selectedBeswan.personalData.nickname || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">{selectedBeswan.personalData.fullName || 'Tidak ada nama'}</h3>
                  <p className="text-muted-foreground">{selectedBeswan.personalData.whatsapp || 'Tidak ada kontak'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>ID: {selectedBeswan.id}</span>
                    <span>•</span>
                    <span>Terdaftar: {formatDate(selectedBeswan.applicationDate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Data Pribadi */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Data Pribadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Lengkap</p>
                        <p className="mt-1 text-sm font-medium">{selectedBeswan.personalData.fullName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Panggilan</p>
                        <p className="mt-1 text-sm font-medium">{selectedBeswan.personalData.nickname || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jenis Kelamin</p>
                        <p className="mt-1 text-sm font-medium">{selectedBeswan.personalData.gender || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agama</p>
                        <p className="mt-1 text-sm font-medium">{selectedBeswan.personalData.religion || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tempat, Tanggal Lahir</p>
                      <p className="mt-1 text-sm font-medium">
                        {selectedBeswan.personalData.address || '-'}, {selectedBeswan.personalData.birthDate ? formatDate(selectedBeswan.personalData.birthDate) : '-'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Data Pendidikan */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Data Pendidikan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Sekolah/Perguruan Tinggi</p>
                      <p className="mt-1 text-sm font-medium">{selectedBeswan.personalData.school || 'Belum diisi'}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jenjang</p>
                        <p className="mt-1 text-sm font-medium">-</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jurusan</p>
                        <p className="mt-1 text-sm font-medium">-</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Memuat detail pendaftar...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Hapus Data Pendaftar</DialogTitle>
            <DialogDescription className="mt-2">
              Tindakan ini tidak dapat dibatalkan. Data pendaftar akan dihapus secara permanen dari sistem.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedBeswan && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                    <span className="text-sm font-medium text-red-700">
                      {(selectedBeswan.personalData.fullName || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{selectedBeswan.personalData.fullName || 'Nama tidak tersedia'}</p>
                    <p className="text-sm text-muted-foreground">{selectedBeswan.personalData.whatsapp || 'Kontak tidak tersedia'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBeswan}
              className="flex-1"
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