import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export const LoadingButton = ({ loading, children, disabled, ...props }: LoadingButtonProps) => {
  return (
    <Button
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        children
      )}
    </Button>
  );
};