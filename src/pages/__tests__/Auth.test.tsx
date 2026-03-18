import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from '@/pages/Auth';

const { navigate, toast, signInWithPassword } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: vi.fn(),
  signInWithPassword: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      setSession: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signUp: vi.fn(),
      signInWithPassword,
    },
  },
}));

describe('Auth page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithPassword.mockResolvedValue({ error: null });
  });

  it('submits the sign-in form and navigates to /app', async () => {
    const user = userEvent.setup();

    render(<Auth />);

    await user.type(screen.getByLabelText('邮箱'), 'me@example.com');
    await user.type(screen.getByLabelText('密码'), 'secret123');
    await user.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'me@example.com',
        password: 'secret123',
      });
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '登录成功',
      }),
    );
    expect(navigate).toHaveBeenCalledWith('/app');
  });
});
