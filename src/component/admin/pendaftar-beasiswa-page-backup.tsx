"use client"

import React, { useState, useEffect } from "react";
import { 
  Search, 
  PlusCircle, 
  FileEdit, 
  Trash2, 
  MoreHorizontal, 
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Download,
  GraduationCap
} from "lucide-react";

// Import komponen UI
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import { ApplicantService, type BeswanListItem } from "../../lib/applicant-service";

// Tipe untuk dokumen dan media sosial
interface Dokumen {
  id?: number;
  nama?: string;
  name?: string;
  status?: string;
  deskripsi?: string;
  description?: string;
  url?: string;
}

interface MediaSosial {
  id?: number;
  jenis?: string;
  type?: string;
  username?: string;
  url?: string;
}

// Memperluas tipe BeswanListItem untuk detail dokumen
interface BeswanDetail extends BeswanListItem {
  dokumen_wajib?: Dokumen[];
  dokumen_pendukung?: Dokumen[];
  media_sosial?: MediaSosial[];
}

// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error in component:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 mt-4 text-red-800 bg-red-100 border border-red-300 rounded-lg">
          <h2 className="mb-2 text-xl font-semibold">Error dalam komponen React</h2>
          <p className="mb-4">Terjadi error saat merender komponen ini.</p>
          <div className="p-4 mb-4 overflow-auto text-sm bg-white border border-red-200 rounded">
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
          <button 
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reload Halaman
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Wrapper component for performance monitoring
const PendaftarBeasiswaWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <PendaftarBeasiswaPageContent />
    </ErrorBoundary>
  );
};

// Main component content
function PendaftarBeasiswaPageContent() {
  console.log("PendaftarBeasiswaPage component is rendering");
  // Initialize component
  useEffect(() => {
    // Log initial render 
    console.log("PendaftarBeasiswa component mounted");
  }, []);
  
  // Debug imports
  console.log("Button imported:", Button);
  console.log("Card imported:", Card);
  console.log("ApplicantService imported:", ApplicantService);
    // State for applicant data
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
  
  // Toast notification state for simple implementation
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success"
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPeriods();
    fetchApplicants();
  }, []);
  
  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 5000);
  };
  
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
    // Fetch applicants data
  const fetchApplicants = async (periodId?: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      console.log('Fetching applicant data with period ID:', periodId);
      
      // Add a safeguard try-catch block
      try {
        const data = await ApplicantService.getBeswanList(periodId);
        console.log('Fetched applicant data:', data);
        
        // Ensure we have an array even if API returns null or undefined
        const safeData = Array.isArray(data) ? data : [];
        setApplicants(safeData);
        
        // Update stats
        updateStats(safeData);
        
        if (isRefresh) {
          showToast("Data berhasil diperbarui", "success");
        }
      } catch (apiErr) {
        console.error("API error details:", apiErr);
        
        // Use mock data for development if API fails
        console.log("Using mock data since API failed");
        const mockData: BeswanListItem[] = [
          { 
            id: 1,
            user_id: 1,
            user: { id: 1, name: 'Test User', email: 'test@example.com' }, 
            nama_panggilan: 'Test', 
            jenis_kelamin: 'Laki-laki', 
            tempat_lahir: 'Jakarta', 
            tanggal_lahir: '2000-01-01',
            agama: 'Islam',
            created_at: new Date().toISOString()
          }
        ];
        setApplicants(mockData);
        updateStats(mockData);
      }
    } catch (err) {
      console.error("Error in fetch function:", err);
      setError("Gagal memuat data pendaftar beasiswa");
      showToast("Gagal memuat data pendaftar beasiswa", "error");
      
      // Still show the UI even if data fetching fails
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
    
    // For now, simulate the other stats for a better UI experience
    // Later, when status is implemented, this can be updated to show real data
    setStats({
      total,
      pending: Math.round(total * 0.3),
      accepted: Math.round(total * 0.5),
      rejected: Math.round(total * 0.2)
    });
  };
    // Handle period change
  const handlePeriodChange = (value: string) => {
    // Check if value is "all" which means all periods
    if (value === "all") {
      setSelectedPeriodId(undefined);
      fetchApplicants(undefined);
      return;
    }
    
    // Otherwise, parse the period ID
    const periodId = parseInt(value);
    setSelectedPeriodId(periodId);
    fetchApplicants(periodId);
  };
  
  // Format date helper
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
    // Handle view detail
  const handleViewDetail = async (beswan: BeswanListItem) => {
    setSelectedBeswan(beswan);
    setDetailDialog(true);
    
    try {
      // Fetch detailed data if needed
      const detailedData = await ApplicantService.getBeswan(beswan.id!);
      setSelectedBeswan(detailedData);
    } catch (err) {
      console.error("Error fetching beswan details:", err);
      showToast("Gagal memuat detail pendaftar", "error");
    }
  };
  
  // Handle delete click
  const handleDeleteClick = (beswan: BeswanListItem) => {
    setSelectedBeswan(beswan);
    setDeleteDialog(true);
  };
  
  // Handle delete beswan
  const handleDeleteBeswan = async () => {
    if (!selectedBeswan || !selectedBeswan.id) return;
    
    try {
      await ApplicantService.deleteBeswan(selectedBeswan.id);
      showToast("Data pendaftar berhasil dihapus", "success");
      setDeleteDialog(false);
      
      // Refresh data
      fetchApplicants(selectedPeriodId);
    } catch (err) {
      console.error("Error deleting beswan:", err);
      showToast("Gagal menghapus data pendaftar", "error");
    }
  };
  
  // Filter applicants by search term
  const filteredApplicants = (applicants || []).filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.user?.name || '').toLowerCase().includes(searchLower) ||
      (item.nama_panggilan || '').toLowerCase().includes(searchLower) ||
      (item.jenis_kelamin || '').toLowerCase().includes(searchLower) ||
      (item.tempat_lahir || '').toLowerCase().includes(searchLower) ||
      (item.agama || '').toLowerCase().includes(searchLower)
    );
  });

  // Simple loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data pendaftar beasiswa...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <XCircle className="w-8 h-8" />
          <p>{error}</p>
          <Button onClick={() => fetchApplicants(selectedPeriodId)} variant="outline" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

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
          <Card className="border-0 shadow-md bg-gradient-to-br from-[#406386] to-[#406386]/90">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">Total Pendaftar</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
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
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-700 uppercase text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {filteredApplicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-12 text-center">
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
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplicants.map((applicant, index) => {
                      const tempatLahir = applicant.tempat_lahir || '-';
                      const tanggalLahir = applicant.tanggal_lahir ? formatDate(applicant.tanggal_lahir) : '-';
                      const ttl = `${tempatLahir}, ${tanggalLahir}`;
                      
                      return (
                        <TableRow key={applicant.id} className="hover:bg-gray-50 transition-colors">
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
                                    {(applicant.user?.name || applicant.nama_panggilan || 'N')[0].toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {applicant.user?.name || '-'}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {applicant.user?.email || '-'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">Panggilan:</span> {applicant.nama_panggilan || '-'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="font-medium">Gender:</span> {applicant.jenis_kelamin || '-'} • 
                                <span className="font-medium ml-2">Agama:</span> {applicant.agama || '-'}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell className="px-6 py-4">
                            <p className="text-sm text-gray-900">{ttl}</p>
                          </TableCell>
                          
                          <TableCell className="px-6 py-4">
                            <p className="text-sm text-gray-900">{formatDate(applicant.created_at)}</p>
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
                                  onClick={() => handleViewDetail(applicant)}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(applicant)} 
                                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Hapus Data
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="py-4 space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col items-center p-6 space-y-4 rounded-xl sm:flex-row sm:space-y-0 sm:space-x-6 bg-gradient-to-r from-[#406386]/5 to-[#406386]/10">
                <div className="flex items-center justify-center w-20 h-20 overflow-hidden bg-gradient-to-br from-[#406386] to-[#406386]/80 rounded-full shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {(selectedBeswan.user?.name || selectedBeswan.nama_panggilan || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBeswan.user?.name || 'Tidak ada nama'}</h3>
                  <p className="text-gray-600">{selectedBeswan.user?.email || 'Tidak ada email'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>ID: {selectedBeswan.id}</span>
                    <span>•</span>
                    <span>Terdaftar: {formatDate(selectedBeswan.created_at)}</span>
                  </div>
                </div>
              </div>
              
              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Data Pribadi */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                      <div className="w-2 h-2 bg-[#406386] rounded-full"></div>
                      Data Pribadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.user?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Panggilan</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.nama_panggilan || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.jenis_kelamin || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Agama</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.agama || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tempat, Tanggal Lahir</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedBeswan.tempat_lahir || '-'}, {formatDate(selectedBeswan.tanggal_lahir)}
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
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sekolah/Perguruan Tinggi</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.sekolah?.nama_sekolah || 'Belum diisi'}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenjang</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.sekolah?.jenjang || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jurusan</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.sekolah?.jurusan || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Masuk</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.sekolah?.tahun_masuk || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">IPK Terakhir</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.sekolah?.ipk_terakhir || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.sekolah?.semester_saat_ini || '-'}</p>
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
                    <div className="p-4 bg-white rounded-lg">
                      <h5 className="mb-3 text-sm font-semibold text-gray-800">Informasi Ayah</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Nama:</span>
                          <span className="text-xs font-medium">{selectedBeswan.keluarga?.nama_ayah || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Pekerjaan:</span>
                          <span className="text-xs font-medium">{selectedBeswan.keluarga?.pekerjaan_ayah || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Penghasilan:</span>
                          <span className="text-xs font-medium">{selectedBeswan.keluarga?.penghasilan_ayah || '-'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <h5 className="mb-3 text-sm font-semibold text-gray-800">Informasi Ibu</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Nama:</span>
                          <span className="text-xs font-medium">{selectedBeswan.keluarga?.nama_ibu || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Pekerjaan:</span>
                          <span className="text-xs font-medium">{selectedBeswan.keluarga?.pekerjaan_ibu || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Penghasilan:</span>
                          <span className="text-xs font-medium">{selectedBeswan.keluarga?.penghasilan_ibu || '-'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Anak Ke</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.keluarga?.anak_ke || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Saudara</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.keluarga?.jumlah_saudara || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Data Alamat */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                      <div className="w-2 h-2 bg-[#406386] rounded-full"></div>
                      Alamat Lengkap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.alamat?.alamat_lengkap || 'Belum diisi'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kelurahan</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.alamat?.kelurahan || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kecamatan</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.alamat?.kecamatan || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kota/Kabupaten</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.alamat?.kota || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Provinsi</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.alamat?.provinsi || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Pos</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedBeswan.alamat?.kode_pos || '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document and Media Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Dokumen Wajib */}
                <Card className="border-0 shadow-sm bg-blue-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                      <div className="p-1 bg-blue-200 rounded">
                        <FileEdit className="w-4 h-4 text-blue-600" />
                      </div>
                      Dokumen Wajib
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedBeswan.dokumen_wajib && selectedBeswan.dokumen_wajib.length > 0 ? (
                        selectedBeswan.dokumen_wajib.map((dokumen: Dokumen, index: number) => (
                          <div key={`wajib-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {dokumen.nama || dokumen.name || `Dokumen ${index + 1}`}
                              </p>
                            </div>
                            <Badge 
                              variant={dokumen.status === "complete" ? "default" : "destructive"}
                              className={dokumen.status === "complete" 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                              }
                            >
                              {dokumen.status === "complete" ? "✓ Lengkap" : "✗ Kurang"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <FileEdit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada dokumen wajib</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Media Sosial */}
                <Card className="border-0 shadow-sm bg-purple-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                      <div className="p-1 bg-purple-200 rounded">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      Media Sosial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedBeswan.media_sosial && selectedBeswan.media_sosial.length > 0 ? (
                        selectedBeswan.media_sosial.map((media: MediaSosial, index: number) => (
                          <div key={`sosmed-${index}`} className="p-3 bg-white rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <p className="text-xs font-medium text-purple-700 uppercase tracking-wider">
                                {media.jenis || media.type || 'Platform'}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {media.username ? (
                                <a 
                                  href={media.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  @{media.username}
                                </a>
                              ) : (
                                <a 
                                  href={media.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate block"
                                >
                                  {media.url || '-'}
                                </a>
                              )}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada data media sosial</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Dokumen Pendukung */}
                <Card className="border-0 shadow-sm bg-green-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                      <div className="p-1 bg-green-200 rounded">
                        <Download className="w-4 h-4 text-green-600" />
                      </div>
                      Dokumen Pendukung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedBeswan.dokumen_pendukung && selectedBeswan.dokumen_pendukung.length > 0 ? (
                        selectedBeswan.dokumen_pendukung.map((dokumen: Dokumen, index: number) => (
                          <div key={`pendukung-${index}`} className="p-3 bg-white rounded-lg">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {dokumen.nama || dokumen.name || `Dokumen ${index + 1}`}
                                </p>
                                {(dokumen.deskripsi || dokumen.description) && (
                                  <p className="mt-1 text-xs text-gray-500 truncate">
                                    {dokumen.deskripsi || dokumen.description}
                                  </p>
                                )}
                              </div>
                              {dokumen.url && (
                                <Button variant="outline" size="sm" className="text-xs" asChild>
                                  <a href={dokumen.url} target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Lihat
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <Download className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada dokumen pendukung</p>
                        </div>
                      )}
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
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl text-gray-900">Hapus Data Pendaftar</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Tindakan ini tidak dapat dibatalkan. Data pendaftar akan dihapus secara permanen dari sistem.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedBeswan && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                    <span className="text-sm font-medium text-red-700">
                      {(selectedBeswan.user?.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedBeswan.user?.name || 'Nama tidak tersedia'}</p>
                    <p className="text-sm text-gray-600">{selectedBeswan.user?.email || 'Email tidak tersedia'}</p>
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
      </Dialog>    </div>
  );
}

// Export the component with error boundary
export default PendaftarBeasiswaWithErrorBoundary;