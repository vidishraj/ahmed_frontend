import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { fetchPolicyFiles, uploadPolicyFile, deletePolicyFile, downloadPolicyFile, type PolicyFile } from '../api';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import { Upload, Download, Delete, Add, Refresh } from '@mui/icons-material';

const PolicyFiles: React.FC = () => {
  const { user, firebaseUser } = useAuth();
  const [policyFiles, setPolicyFiles] = useState<PolicyFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    loadPolicyFiles();
  }, []);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim() || !firebaseUser) return;
    
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

  const handleDownload = async (fileId: number, fileName: string) => {
    if (!firebaseUser) return;
    
    try {
      const token = await firebaseUser.getIdToken();
      await downloadPolicyFile(fileId, token);
      toast.success(`${fileName} downloaded successfully`);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (fileId: number, fileName: string) => {
    if (!firebaseUser) return;
    
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    
    try {
      const token = await firebaseUser.getIdToken();
      await deletePolicyFile(fileId, token);
      toast.success(`${fileName} deleted successfully`);
      loadPolicyFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Policy Files Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadPolicyFiles}
            disabled={loading}
            sx={{
              borderColor: '#b8e3cb',
              color: '#266541',
              fontWeight: 600,
              bgcolor: '#effaf5',
              '&:hover': {
                borderColor: '#86b29a',
                bgcolor: '#b8e3cb',
                color: '#266541',
              },
            }}
          >
            Refresh
          </Button>
          {user?.role === 'superadmin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setUploadDialogOpen(true)}
              disabled={policyFiles.length >= 10}
              sx={{
                bgcolor: '#266541',
                color: '#effaf5',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#1a4a2f',
                  color: '#effaf5',
                },
              }}
            >
              Upload New File
            </Button>
          )}
        </Box>
      </Box>

      {policyFiles.length >= 10 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Maximum number of policy files (10) reached. Delete existing files to upload new ones.
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Original Filename</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : policyFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No policy files available
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                policyFiles.map((file) => (
                  <TableRow key={file.id} hover>
                    <TableCell>
                      <Tooltip title={file.name}>
                        <Typography
                          sx={{
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {file.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={file.original_filename}>
                        <Typography
                          sx={{
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {file.original_filename}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatFileSize(file.file_size)} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>{file.uploaded_by}</TableCell>
                    <TableCell>{formatDate(file.upload_date)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(file.id, file.name)}
                            color="primary"
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                                                 {user?.role === 'superadmin' && (
                           <Tooltip title="Delete">
                             <IconButton
                               size="small"
                               onClick={() => handleDelete(file.id, file.name)}
                               color="error"
                             >
                               <Delete fontSize="small" />
                             </IconButton>
                           </Tooltip>
                         )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
                File size: {formatFileSize(selectedFile.size)}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Maximum file size: 20MB. Current files: {policyFiles.length}/10
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !fileName.trim() || uploading}
            variant="contained"
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PolicyFiles; 