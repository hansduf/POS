// Utility for converting numbers to Indonesian word representation (Terbilang)
export function terbilang(n: number): string {
  if (n < 0) return 'minus ' + terbilang(Math.abs(n));
  if (n === 0) return 'Nol Rupiah';

  const angka = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function konversi(val: number): string {
    let result = '';
    if (val < 12) {
      result = ' ' + angka[val];
    } else if (val < 20) {
      result = konversi(val - 10) + ' Belas';
    } else if (val < 100) {
      result = konversi(Math.floor(val / 10)) + ' Puluh' + konversi(val % 10);
    } else if (val < 200) {
      result = ' Seratus' + konversi(val - 100);
    } else if (val < 1000) {
      result = konversi(Math.floor(val / 100)) + ' Ratus' + konversi(val % 100);
    } else if (val < 2000) {
      result = ' Seribu' + konversi(val - 1000);
    } else if (val < 1000000) {
      result = konversi(Math.floor(val / 1000)) + ' Ribu' + konversi(val % 1000);
    } else if (val < 1000000000) {
      result = konversi(Math.floor(val / 1000000)) + ' Juta' + konversi(val % 1000000);
    } else if (val < 1000000000000) {
      result = konversi(Math.floor(val / 1000000000)) + ' Miliar' + konversi(val % 1000000000);
    }
    return result;
  }

  const teks = konversi(Math.floor(n)).trim();
  return (teks ? teks + ' Rupiah' : 'Nol Rupiah');
}
