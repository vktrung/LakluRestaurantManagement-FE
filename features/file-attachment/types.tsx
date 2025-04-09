export interface FileAttachment {
    id: number;            
    mimeType: string;      
    originalName: string;  
    randomName: string;   
    size: number;          
    targetName?: string;  
    targetId?: string;    
    path: string;         
  }
  
  export interface FileAttachmentRequest {
    file: File; 
  }
  
 
  export interface FileAttachmentResponse {
 data: FileAttachment;
   message: string;
   httpStatus: number;
   timestamp: string;
   error: null | string;
  }
  