import { redirect } from 'next/navigation';

export default function CardRedirectPage() {
  redirect('/transactions');
}
