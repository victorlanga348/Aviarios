import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn({ email, password });
      toast.success('Bem-vindo!');
      navigate('/');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao entrar. Verifique suas credenciais.'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-md z-10 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 mb-6 animate-float">
            <LogIn size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Bem-vindo de volta
          </h1>
          <p className="text-muted text-lg">Gerencie seu aviário com precisão</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-[2rem] shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-secondary border border-border p-4 pl-12 rounded-2xl outline-none focus:border-primary/50 focus:bg-secondary/80 transition-all text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary border border-border p-4 pl-12 pr-12 rounded-2xl outline-none focus:border-primary/50 focus:bg-secondary/80 transition-all text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors select-none pointer-events-auto"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-emerald-500 text-black font-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-muted">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Cadastre-se agora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
