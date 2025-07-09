import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../api';

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  message: string;
  error: boolean;
}

const Upload: React.FC = () => {
  const [state, setState] = useState<FileUploadState>({ file: null, uploading: false, message: '', error: false });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, firebaseUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setState(s => ({ ...s, file: e.target.files![0], message: '', error: false }));
    }
  };

  const handleUpload = async () => {
    if (!state.file) return;
    setState(s => ({ ...s, uploading: true, message: '', error: false }));
    try {
      if (!user || !firebaseUser) throw new Error('You must be logged in to upload.');
      const token = await firebaseUser.getIdToken();
      await uploadFile('/api/upload-emissions/', state.file, token);
      setState(s => ({ ...s, uploading: false, message: 'Upload successful!', error: false, file: null }));
      toast.success('Upload successful!');
    } catch (err: any) {
      setState(s => ({ ...s, uploading: false, message: err.message || 'Upload failed. Please try again.', error: true }));
      toast.error(err.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Upload Data</h1>
      <div style={{ background: 'var(--color-light)', padding: '2rem', borderRadius: 12, maxWidth: 500, margin: '2rem auto', boxShadow: '0 2px 8px rgba(38,101,65,0.08)' }}>
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          style={{ background: 'var(--color-darkest)', color: 'var(--color-lightest)', padding: '0.75rem 1.5rem', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose File
        </button>
        {state.file && (
          <div style={{ marginTop: 16, background: 'var(--color-lightest)', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(38,101,65,0.06)' }}>
            <strong>File:</strong> {state.file.name}<br />
            <strong>Size:</strong> {(state.file.size / 1024).toFixed(2)} KB<br />
            <strong>Type:</strong> {state.file.type || 'N/A'}
          </div>
        )}
        <div style={{ marginTop: 24 }}>
          <button
            style={{ background: 'var(--color-dark)', color: 'var(--color-darkest)', padding: '0.75rem 1.5rem', border: 'none', borderRadius: 6, cursor: state.file ? 'pointer' : 'not-allowed', fontWeight: 600, opacity: state.file ? 1 : 0.5 }}
            onClick={handleUpload}
            disabled={!state.file || state.uploading}
          >
            {state.uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {state.message && (
          <div style={{ marginTop: 16, color: state.error ? 'red' : 'green', fontWeight: 500 }}>{state.message}</div>
        )}
      </div>
    </div>
  );
};

export default Upload; 