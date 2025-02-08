import { FormResetPassword } from '@/app/(public)/forgot-password/reset/FormResetPassword';
import { ModalForm } from '@/components/Modal/ModalForm';
export const metadata = {
  title: 'Forgot Password | Brain Flip',
  description: 'Login to your account',
};

const ForgotPasswordPage = () => {
  return (
    <ModalForm
      header="Reset password"
      backdrop="opaque"
      isCloseBtn={false}
      hideCloseButton
      isAlwaysOpen
    >
      <FormResetPassword />
    </ModalForm>
  );
};

export default ForgotPasswordPage;
