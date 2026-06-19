import { useCallback } from 'react';

interface MidtransSnapToken {
  token: string;
  redirect_url: string;
}

interface SnapPaymentOptions {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: SnapPaymentOptions) => void;
      embed: (token: string, options: any) => void;
      show: () => void;
      hide: () => void;
    };
  }
}

export const useMidtransSnap = () => {
  const payWithSnap = useCallback((snapData: MidtransSnapToken, options?: SnapPaymentOptions) => {
    if (!window.snap) {
      console.error('Midtrans Snap is not loaded');
      return;
    }

    window.snap.pay(snapData.token, {
      onSuccess: (result) => {
        console.log('Payment success:', result);
        options?.onSuccess?.(result);
      },
      onPending: (result) => {
        console.log('Payment pending:', result);
        options?.onPending?.(result);
      },
      onError: (result) => {
        console.log('Payment error:', result);
        options?.onError?.(result);
      },
      onClose: () => {
        console.log('Payment popup closed');
        options?.onClose?.();
      },
    });
  }, []);

  const embedSnap = useCallback((snapData: MidtransSnapToken, containerId: string, options?: SnapPaymentOptions) => {
    if (!window.snap) {
      console.error('Midtrans Snap is not loaded');
      return;
    }

    window.snap.embed(snapData.token, {
      embedId: containerId,
      onSuccess: (result) => {
        console.log('Payment success:', result);
        options?.onSuccess?.(result);
      },
      onPending: (result) => {
        console.log('Payment pending:', result);
        options?.onPending?.(result);
      },
      onError: (result) => {
        console.log('Payment error:', result);
        options?.onError?.(result);
      },
      onClose: () => {
        console.log('Payment popup closed');
        options?.onClose?.();
      },
    });
  }, []);

  const redirectToSnap = useCallback((redirectUrl: string) => {
    window.location.href = redirectUrl;
  }, []);

  return {
    payWithSnap,
    embedSnap,
    redirectToSnap,
  };
};
