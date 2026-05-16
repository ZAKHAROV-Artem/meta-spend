import { AuthCard } from '../auth-card';

export default function ConfirmPage() {
  return (
    <AuthCard>
      <div className="text-center space-y-3">
        <div className="text-4xl">📬</div>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent you a confirmation link. Click it to activate your account, then sign in.
        </p>
      </div>
    </AuthCard>
  );
}
