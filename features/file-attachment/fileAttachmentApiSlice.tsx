import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FileAttachment, FileAttachmentRequest, FileAttachmentResponse } from './types';
import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
export const fileAttachmentApiSlice = createApi({
  reducerPath: 'fileApi',  
  baseQuery,
  endpoints: (builder) => ({
    // Upload file endpoint (POST)
    uploadFile: builder.mutation<FileAttachmentResponse, FormData>({
      query: (formData) => ({
        url: endpoints.FileAttachmentApi,
        method: 'POST',
        body: formData,  
      }),
    }),

    // Get file by filename (GET)
    getFileByFilename: builder.query<FileAttachmentResponse, string>({
      query: (filename) => ({
        url: `${endpoints.FileAttachmentApi}/${filename}`, 
        method: 'GET',
      }),
    }),
  }),
});

export const { useUploadFileMutation, useGetFileByFilenameQuery } = fileAttachmentApiSlice;
