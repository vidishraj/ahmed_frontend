import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../App.css';
import logo from '../assets/logo.jpeg'; // adjust path if needed
import { useState } from 'react';
import { fetchPolicyFiles, downloadPolicyFile, uploadPolicyFile, deletePolicyFile, type PolicyFile } from '../api';
import { 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box, 
  Typography, 
  IconButton,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import { Download, Upload, Delete, CloudDownload } from '@mui/icons-material';

interface NavLink {
  to: string;
  label: string;
  show?: boolean;
  onClick?: () => void;
}

const Header: React.FC = () => {
  const { user, logout, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [policyFilesAnchor, setPolicyFilesAnchor] = useState<null | HTMLElement>(null);
  const [policyFiles, setPolicyFiles] = useState<PolicyFile[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const handlePolicyFilesClick = (event: React.MouseEvent<HTMLElement>) => {
    setPolicyFilesAnchor(event.currentTarget);
    loadPolicyFiles();
  };

  const handlePolicyFilesClose = () => {
    setPolicyFilesAnchor(null);
  };

  const loadPolicyFiles = async () => {
    if (!firebaseUser) return;
    
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const files = await fetchPolicyFiles(token);
      setPolicyFiles(files);
    } catch (error: any) {
      console.error('Error loading policy files:', error);
      toast.error('Failed to load policy files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: number) => {
    if (!firebaseUser) return;
    
    try {
      const token = await firebaseUser.getIdToken();
      await downloadPolicyFile(fileId, token);
      toast.success('File downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleUpload = async () => {
    if (!firebaseUser || !selectedFile || !fileName.trim()) return;
    
    setUploading(true);
    try {
      const token = await firebaseUser.getIdToken();
      await uploadPolicyFile(selectedFile, fileName.trim(), token);
      toast.success('Policy file uploaded successfully');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setFileName('');
      loadPolicyFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!firebaseUser) return;
    
    if (!window.confirm('Are you sure you want to delete this policy file?')) return;
    
    try {
      const token = await firebaseUser.getIdToken();
      await deletePolicyFile(fileId, token);
      toast.success('Policy file deleted successfully');
      loadPolicyFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      // Auto-populate filename without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFileName(nameWithoutExt);
    }
  };

  const navLinks: NavLink[] = [
    { to: '/dashboard', label: 'Dashboard', show: user?.role === 'user' || user?.role === 'admin' || user?.role === 'superadmin'  },
    { to: '/upload', label: 'Upload', show: user?.role === 'admin' || user?.role === 'superadmin' },
    { to: '/role-management', label: 'Role Management', show: user?.role === 'superadmin' },
    user
      ? { to: '#', label: 'Logout', show: true, onClick: handleLogout }
      : { to: '/login', label: 'Login', show: true },
  ];

  return (
    <header>
      <div className="header-logo">
        <img src={logo} alt="Logo" style={{ height: 32, borderRadius: '50%' }} />
        NCEC-DOE
      </div>
      <nav className="header-nav">
        {user && (
          <>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePolicyFilesClick(e as any);
              }}
              className="policy-files-link"
            >
              Policy Files
              <CloudDownload style={{ marginLeft: '4px', fontSize: '20px', verticalAlign: 'text-bottom' }} />
            </a>
            <Menu
              anchorEl={policyFilesAnchor}
              open={Boolean(policyFilesAnchor)}
              onClose={handlePolicyFilesClose}
              PaperProps={{
                sx: {  maxWidth: 250 }
              }}
            >
              {loading ? (
                <MenuItem>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading files...
                </MenuItem>
              ) : (
                <>
                  {user.role === 'superadmin' && (
                    <MenuItem onClick={() => setUploadDialogOpen(true)}>
                      <Upload sx={{ mr: 1 }} />
                      Upload New Policy File
                    </MenuItem>
                  )}
                  {policyFiles.length === 0 ? (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        No policy files available
                      </Typography>
                    </MenuItem>
                  ) : (
                    policyFiles.map((file) => (
                      <MenuItem key={file.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flex: 1, 
                              fontWeight: 500,
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={file.name} // This adds the tooltip
                          >
                            {file.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(file.id)}
                              title="Download"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                            {user.role === 'superadmin' && (
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(file.id)}
                                title="Delete"
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`${(file.file_size / 1024 / 1024).toFixed(2)} MB`} 
                            size="small" 
                            variant="outlined" 
                          />
                          {/* <Chip 
                            label={`By: ${file.uploaded_by}`} 
                            size="small" 
                            variant="outlined" 
                          /> */}
                          <Chip 
                            label={new Date(file.upload_date).toLocaleDateString()} 
                            size="small" 
                            variant="outlined" 
                          />
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </>
              )}
            </Menu>
          </>
        )}
        {navLinks.filter(link => link.show).map((link) =>
          link.onClick ? (
            <a key={link.label} href="#" onClick={e => { e.preventDefault(); link.onClick && link.onClick(); }}>{link.label}</a>
          ) : (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          )
        )}
      </nav>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Policy File</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              fullWidth
              required
              helperText="Enter a descriptive name for the policy file"
            />
            <Box>
              <input
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="policy-file-input"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              <label htmlFor="policy-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  fullWidth
                >
                  {selectedFile ? selectedFile.name : 'Select File'}
                </Button>
              </label>
            </Box>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Maximum file size: 10MB. Current files: {policyFiles.length}/10
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!selectedFile || !fileName.trim() || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <Upload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </header>
  );
};

export default Header; 