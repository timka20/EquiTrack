
export async function hashPassword(password: string): Promise<string> {

  return password; 
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {

  return password === hash;
}

export function generateRandomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-RU');
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('ru-RU');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}
