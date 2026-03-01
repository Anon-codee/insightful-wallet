import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function VaultCard() {
  const { state, depositToVault, withdrawFromVault, setVaultPin } = useFinance();
  const { vault } = state;

  const [showBalance, setShowBalance] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!vault.pin);
  const [pinInput, setPinInput] = useState('');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw' | null>(null);
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  const handleUnlock = () => {
    if (pinInput === vault.pin) {
      setIsUnlocked(true);
      setPinInput('');
      toast.success('Vault unlocked');
    } else {
      toast.error('Incorrect PIN');
      setPinInput('');
    }
  };

  const handleDeposit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    depositToVault(amt);
    setAmount('');
    setAction(null);
    toast.success(`₹${amt.toLocaleString()} deposited to vault`);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > vault.balance) return toast.error('Insufficient vault balance');
    withdrawFromVault(amt);
    setAmount('');
    setAction(null);
    toast.success(`₹${amt.toLocaleString()} withdrawn from vault`);
  };

  const handleSetPin = () => {
    if (newPin.length < 4) return toast.error('PIN must be at least 4 digits');
    setVaultPin(newPin);
    setNewPin('');
    setSettingPin(false);
    toast.success('Vault PIN set successfully');
  };

  // Monthly savings calculation
  const now = new Date();
  const thisMonthDeposits = vault.history
    .filter(h => {
      const d = new Date(h.date);
      return h.type === 'deposit' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, h) => s + h.amount, 0);

  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-xl p-8 max-w-md mx-auto text-center space-y-6 stat-glow-vault border-vault/20"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vault/10 mx-auto">
          <Lock className="h-8 w-8 text-vault" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Savings Vault Locked</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter your PIN to access</p>
        </div>
        <div className="flex gap-2 max-w-[200px] mx-auto">
          <Input
            type="password"
            maxLength={6}
            placeholder="• • • •"
            value={pinInput}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            className="text-center font-mono text-lg tracking-widest bg-secondary/50"
          />
        </div>
        <Button variant="vault" onClick={handleUnlock} className="w-full max-w-[200px]">
          <Unlock className="h-4 w-4 mr-2" /> Unlock
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Balance Card */}
      <div className="glass-card rounded-xl p-6 stat-glow-vault border-vault/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-vault" />
            <h2 className="text-lg font-bold text-card-foreground">Savings Vault</h2>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold font-mono text-gradient-vault">
            {showBalance ? `₹${vault.balance.toLocaleString()}` : '₹ • • • • •'}
          </p>
          <p className="text-xs text-muted-foreground">
            Saved ₹{thisMonthDeposits.toLocaleString()} this month
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <Button
            variant={action === 'deposit' ? 'vault' : 'outline'}
            size="sm"
            onClick={() => setAction(action === 'deposit' ? null : 'deposit')}
          >
            <ArrowDownToLine className="h-3.5 w-3.5 mr-1" /> Deposit
          </Button>
          <Button
            variant={action === 'withdraw' ? 'vault' : 'outline'}
            size="sm"
            onClick={() => setAction(action === 'withdraw' ? null : 'withdraw')}
          >
            <ArrowUpFromLine className="h-3.5 w-3.5 mr-1" /> Withdraw
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingPin(!settingPin)}
          >
            <Lock className="h-3.5 w-3.5 mr-1" /> {vault.pin ? 'Change PIN' : 'Set PIN'}
          </Button>
        </div>

        {/* Action Inputs */}
        <AnimatePresence>
          {action && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="font-mono bg-secondary/50"
                />
                <Button
                  variant="vault"
                  onClick={action === 'deposit' ? handleDeposit : handleWithdraw}
                >
                  {action === 'deposit' ? 'Deposit' : 'Withdraw'}
                </Button>
              </div>
            </motion.div>
          )}
          {settingPin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Input
                  type="password"
                  maxLength={6}
                  placeholder="New 4-6 digit PIN"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="font-mono bg-secondary/50"
                />
                <Button variant="vault" onClick={handleSetPin}>
                  Set PIN
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Vault History */}
      {vault.history.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Vault Activity
          </h3>
          <div className="space-y-2">
            {vault.history.slice(0, 10).map(h => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  {h.type === 'deposit' ? (
                    <ArrowDownToLine className="h-3.5 w-3.5 text-income" />
                  ) : (
                    <ArrowUpFromLine className="h-3.5 w-3.5 text-expense" />
                  )}
                  <span className="text-sm text-card-foreground capitalize">{h.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className={cn(
                    'font-mono text-sm font-semibold',
                    h.type === 'deposit' ? 'text-income' : 'text-expense'
                  )}>
                    {h.type === 'deposit' ? '+' : '-'}₹{h.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
