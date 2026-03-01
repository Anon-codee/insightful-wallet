import { VaultCard } from '@/components/vault/VaultCard';
import { Vault as VaultIcon } from 'lucide-react';

export default function VaultPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vault/10">
          <VaultIcon className="h-5 w-5 text-vault" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Savings Vault</h1>
          <p className="text-sm text-muted-foreground">Your secure savings space</p>
        </div>
      </div>
      <VaultCard />
    </div>
  );
}
