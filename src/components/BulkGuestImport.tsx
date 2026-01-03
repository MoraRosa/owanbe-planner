import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { createGuest } from '@/lib/indexedDb';
import { 
  Upload, FileSpreadsheet, AlertCircle, Check, 
  Download, X, Users
} from 'lucide-react';

interface ParsedGuest {
  name: string;
  email?: string;
  phone?: string;
  plusOnes: number;
  dietaryNotes?: string;
  isValid: boolean;
  error?: string;
}

interface BulkGuestImportProps {
  eventId: string;
  onImportComplete: () => void;
}

export default function BulkGuestImport({ eventId, onImportComplete }: BulkGuestImportProps) {
  const [open, setOpen] = useState(false);
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ParsedGuest[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header to find column indices
    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(',').map(h => h.trim().replace(/['"]/g, ''));
    
    const nameIndex = headers.findIndex(h => 
      h.includes('name') || h === 'guest' || h === 'full name'
    );
    const emailIndex = headers.findIndex(h => h.includes('email'));
    const phoneIndex = headers.findIndex(h => 
      h.includes('phone') || h.includes('mobile') || h.includes('tel')
    );
    const plusOnesIndex = headers.findIndex(h => 
      h.includes('plus') || h.includes('guest') || h.includes('additional')
    );
    const dietaryIndex = headers.findIndex(h => 
      h.includes('diet') || h.includes('allerg') || h.includes('food')
    );

    const guests: ParsedGuest[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted values with commas
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const name = nameIndex >= 0 ? values[nameIndex]?.replace(/['"]/g, '') : values[0]?.replace(/['"]/g, '');
      const email = emailIndex >= 0 ? values[emailIndex]?.replace(/['"]/g, '') : undefined;
      const phone = phoneIndex >= 0 ? values[phoneIndex]?.replace(/['"]/g, '') : undefined;
      const plusOnesStr = plusOnesIndex >= 0 ? values[plusOnesIndex]?.replace(/['"]/g, '') : '0';
      const dietaryNotes = dietaryIndex >= 0 ? values[dietaryIndex]?.replace(/['"]/g, '') : undefined;

      const plusOnes = parseInt(plusOnesStr) || 0;

      // Validate
      let isValid = true;
      let error: string | undefined;

      if (!name || name.trim().length === 0) {
        isValid = false;
        error = 'Name is required';
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        isValid = false;
        error = 'Invalid email format';
      }

      guests.push({
        name: name || '',
        email: email || undefined,
        phone: phone || undefined,
        plusOnes: Math.max(0, Math.min(10, plusOnes)),
        dietaryNotes: dietaryNotes || undefined,
        isValid,
        error,
      });
    }

    return guests;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const guests = parseCSV(text);
      
      if (guests.length === 0) {
        toast({ 
          title: 'No guests found', 
          description: 'Please check your CSV format',
          variant: 'destructive' 
        });
        return;
      }

      setParsedGuests(guests);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validGuests = parsedGuests.filter(g => g.isValid);
    if (validGuests.length === 0) {
      toast({ title: 'No valid guests to import', variant: 'destructive' });
      return;
    }

    setIsImporting(true);

    try {
      for (const guest of validGuests) {
        await createGuest({
          eventId,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          rsvpStatus: 'pending',
          plusOnes: guest.plusOnes,
          dietaryNotes: guest.dietaryNotes,
        });
      }

      setStep('complete');
      toast({ title: `Successfully imported ${validGuests.length} guests!` });
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Error importing guests', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  };

  const removeGuest = (index: number) => {
    setParsedGuests(prev => prev.filter((_, i) => i !== index));
  };

  const resetDialog = () => {
    setParsedGuests([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = 'Name,Email,Phone,Plus Ones,Dietary Notes\nJohn Doe,john@example.com,+1 234 567 8900,1,Vegetarian\nJane Smith,jane@example.com,,0,\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedGuests.filter(g => g.isValid).length;
  const invalidCount = parsedGuests.filter(g => !g.isValid).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetDialog(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" /> Import Guests
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Guests from CSV</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6 pt-4">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file with your guest list. Required column: Name
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" /> Choose File
                      </label>
                    </Button>
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" /> Download Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">CSV Format</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Your CSV should have these columns (only Name is required):
                </p>
                <div className="bg-muted rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <div className="text-muted-foreground">Name, Email, Phone, Plus Ones, Dietary Notes</div>
                  <div>John Doe, john@email.com, +1234567890, 1, Vegetarian</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 pt-4">
            {/* Summary */}
            <div className="flex gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {parsedGuests.length} Total
              </Badge>
              <Badge className="flex items-center gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                <Check className="h-3 w-3" /> {validCount} Valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {invalidCount} Invalid
                </Badge>
              )}
            </div>

            {/* Guest Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plus Ones</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedGuests.slice(0, 10).map((guest, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{guest.name || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{guest.email || '-'}</TableCell>
                      <TableCell>{guest.plusOnes}</TableCell>
                      <TableCell>
                        {guest.isValid ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            <Check className="h-3 w-3 mr-1" /> Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            {guest.error}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => removeGuest(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedGuests.length > 10 && (
                <div className="p-3 text-center text-sm text-muted-foreground bg-muted/50">
                  And {parsedGuests.length - 10} more guests...
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={validCount === 0 || isImporting}
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>Import {validCount} Guests</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-display text-foreground mb-2">Import Complete!</h3>
            <p className="text-muted-foreground mb-6">
              Successfully imported {validCount} guests to your event.
            </p>
            <Button onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}