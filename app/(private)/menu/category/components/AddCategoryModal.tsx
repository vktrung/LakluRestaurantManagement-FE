import { useCreateCategoryMutation } from '@/features/category/categoryApiSlice';
import { CategoryRequest } from '@/features/category/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { z } from "zod";

const categorySchema = z.object({
  name: z.string()
    .min(1, "Tên danh mục không được để trống")
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(50, "Tên danh mục không được vượt quá 50 ký tự")
    .refine(value => /^[a-zA-ZÀ-ỹ0-9\s]+$/.test(value), {
      message: "Tên danh mục chỉ được chứa chữ cái, số và khoảng trắng"
    }),
  description: z.string()
    .max(200, "Mô tả không được vượt quá 200 ký tự")
    .refine(value => value === '' || value.trim().length >= 5, {
      message: "Mô tả phải có ít nhất 5 ký tự hoặc để trống"
    })
    .refine(value => /^[a-zA-ZÀ-ỹ0-9\s.,!?()-]*$/.test(value), {
      message: "Mô tả chỉ được chứa chữ cái, số và các ký tự đặc biệt thông dụng"
    })
    .optional()
});

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
}: AddCategoryModalProps) {
  const [createCategory] = useCreateCategoryMutation();
  const [formData, setFormData] = useState<CategoryRequest>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    try {
      categorySchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createCategory(formData).unwrap();
      toast.success('Tạo danh mục mới thành công');
      onClose();
    } catch (err: any) {
      let errorMessage = 'Không thể tạo danh mục. ';
      if (err?.data?.message) {
        errorMessage += err.data.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CategoryRequest
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Validate length immediately
    if (field === 'name' && value.length > 50) {
      setErrors(prev => ({ 
        ...prev, 
        name: "Tên danh mục không được vượt quá 50 ký tự" 
      }));
    }
    if (field === 'description' && value.length > 200) {
      setErrors(prev => ({ 
        ...prev, 
        description: "Mô tả không được vượt quá 200 ký tự" 
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo danh mục mới</DialogTitle>
          <DialogDescription>
            Thêm danh mục mới vào hệ thống. Nhập đầy đủ thông tin bên dưới.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên danh mục <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange(e, 'name')}
                placeholder="Nhập tên danh mục"
                className={errors.name ? "border-red-500" : ""}
                maxLength={50}
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formData.name.length}/50 ký tự
              </span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange(e, 'description')}
                placeholder="Nhập mô tả cho danh mục"
                rows={3}
                className={errors.description ? "border-red-500" : ""}
                maxLength={200}
              />
              {errors.description && (
                <span className="text-sm text-red-500">{errors.description}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formData.description.length}/200 ký tự
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 