
import { useState } from "react";

const DEBOUNCE_MS = 800;

// Form hook com debounce, isSubmitting e reset
export function useTransactionForm<T>(initial: T, onSubmit: (values: T) => Promise<void> | void) {
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
    try {
      await onSubmit(form); // espera user logic
      resetForm(); // só reseta se der certo
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
