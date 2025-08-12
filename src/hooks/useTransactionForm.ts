import { useState } from "react";

const DEBOUNCE_MS = 800;

// Form hook com debounce, isSubmitting e reset configurável
export function useTransactionForm<T>(
  initial: T, 
  onSubmit: (values: T) => Promise<void> | void, 
  options: { resetOnSuccess?: boolean } = { resetOnSuccess: true }
) {
  const [form, setForm] = useState<T>(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);

  const handleChange = (partial: Partial<T>) =>
    setForm(prev => ({ ...prev, ...partial }));

  const resetForm = () => setForm(initial);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    const now = Date.now();
    if (now - lastSubmit < DEBOUNCE_MS) return;
    setIsSubmitting(true);
    setLastSubmit(now);
    console.log('useTransactionForm: Starting form submission, resetOnSuccess =', options.resetOnSuccess);
    try {
      await onSubmit(form); // espera user logic
      if (options.resetOnSuccess) {
        console.log('useTransactionForm: Resetting form after successful submission');
        resetForm(); // só reseta se der certo E se configurado para resetar
      } else {
        console.log('useTransactionForm: Skipping form reset as resetOnSuccess is false');
      }
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    setForm,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
  }
}