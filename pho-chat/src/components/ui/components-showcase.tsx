"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useI18n } from '@/components/providers/i18n-provider';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Language, PaymentStatus } from '@/lib/enums';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Download,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const sampleTableData = [
  {
    id: "payment_001",
    date: new Date('2024-12-15'),
    amount: 199000,
    status: PaymentStatus.COMPLETED,
    method: "VietQR"
  },
  {
    id: "payment_002",
    date: new Date('2024-11-15'),
    amount: 199000,
    status: PaymentStatus.COMPLETED,
    method: "MoMo"
  },
  {
    id: "payment_003",
    date: new Date('2024-10-15'),
    amount: 199000,
    status: PaymentStatus.FAILED,
    method: "ZaloPay"
  }
];

export function ComponentsShowcase() {
  const { t, language } = useI18n();
  const { success, error, push } = useToast();
  const [progress, setProgress] = React.useState(13);
  const [isVisible, setIsVisible] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleToastDemo = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        success(language === Language.VIETNAMESE ? 'Thành công!' : 'Success!');
        break;
      case 'error':
        error(language === Language.VIETNAMESE ? 'Có lỗi xảy ra!' : 'An error occurred!');
        break;
      case 'info':
        push({ 
          message: language === Language.VIETNAMESE ? 'Thông tin quan trọng' : 'Important information',
          variant: 'default'
        });
        break;
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">
          {language === Language.VIETNAMESE ? 'Thư viện Component' : 'Component Library'}
        </h2>
        <p className="text-muted-foreground">
          {language === Language.VIETNAMESE 
            ? 'Tất cả các component UI được sử dụng trong pho.chat'
            : 'All UI components used in pho.chat'
          }
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">
            {language === Language.VIETNAMESE ? 'Cơ bản' : 'Basic'}
          </TabsTrigger>
          <TabsTrigger value="forms">
            {language === Language.VIETNAMESE ? 'Form' : 'Forms'}
          </TabsTrigger>
          <TabsTrigger value="data">
            {language === Language.VIETNAMESE ? 'Dữ liệu' : 'Data'}
          </TabsTrigger>
          <TabsTrigger value="feedback">
            {language === Language.VIETNAMESE ? 'Phản hồi' : 'Feedback'}
          </TabsTrigger>
          <TabsTrigger value="overlays">
            {language === Language.VIETNAMESE ? 'Overlay' : 'Overlays'}
          </TabsTrigger>
        </TabsList>

        {/* Basic Components */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button className="w-full">Primary Button</Button>
                  <Button variant="secondary" className="w-full">Secondary</Button>
                  <Button variant="outline" className="w-full">Outline</Button>
                  <Button variant="ghost" className="w-full">Ghost</Button>
                  <Button variant="destructive" className="w-full">Destructive</Button>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Settings size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Avatars */}
            <Card>
              <CardHeader>
                <CardTitle>Avatars</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://i.pravatar.cc/32?img=1" />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://i.pravatar.cc/40?img=2" />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="https://i.pravatar.cc/48?img=3" />
                    <AvatarFallback>U3</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-16 h-16">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Form Components */}
        <TabsContent value="forms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vn">Vietnam</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress & Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{progress}% complete</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Loading States</Label>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Display */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === Language.VIETNAMESE ? 'Lịch sử thanh toán' : 'Payment History'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox 
                        checked={selectedItems.length === sampleTableData.length}
                        onCheckedChange={(checked: boolean | "indeterminate") => {
                          if (checked) {
                            setSelectedItems(sampleTableData.map(item => item.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>
                      {language === Language.VIETNAMESE ? 'Ngày' : 'Date'}
                    </TableHead>
                    <TableHead>
                      {language === Language.VIETNAMESE ? 'Số tiền' : 'Amount'}
                    </TableHead>
                    <TableHead>
                      {language === Language.VIETNAMESE ? 'Trạng thái' : 'Status'}
                    </TableHead>
                    <TableHead>
                      {language === Language.VIETNAMESE ? 'Phương thức' : 'Method'}
                    </TableHead>
                    <TableHead>
                      {language === Language.VIETNAMESE ? 'Hành động' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleTableData.map((payment) => (
                    <TableRow 
                      key={payment.id}
                      data-state={selectedItems.includes(payment.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedItems.includes(payment.id)}
                          onCheckedChange={() => toggleItemSelection(payment.id)}
                        />
                      </TableCell>
                      <TableCell>{formatDate(payment.date, language)}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={payment.status === PaymentStatus.COMPLETED ? 'success' : 'destructive'}
                        >
                          {payment.status === PaymentStatus.COMPLETED 
                            ? (language === Language.VIETNAMESE ? 'Hoàn thành' : 'Completed')
                            : (language === Language.VIETNAMESE ? 'Thất bại' : 'Failed')
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon">
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Components */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    This is an informational alert message.
                  </AlertDescription>
                </Alert>

                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your action was completed successfully.
                  </AlertDescription>
                </Alert>

                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Please review your settings before proceeding.
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Something went wrong. Please try again.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Toast Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleToastDemo('success')} 
                    variant="outline" 
                    className="w-full"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Show Success Toast
                  </Button>
                  <Button 
                    onClick={() => handleToastDemo('error')} 
                    variant="outline" 
                    className="w-full"
                  >
                    <AlertCircle size={16} className="mr-2" />
                    Show Error Toast
                  </Button>
                  <Button 
                    onClick={() => handleToastDemo('info')} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Info size={16} className="mr-2" />
                    Show Info Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overlay Components */}
        <TabsContent value="overlays" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {language === Language.VIETNAMESE ? 'Xác nhận hành động' : 'Confirm Action'}
                      </DialogTitle>
                      <DialogDescription>
                        {language === Language.VIETNAMESE 
                          ? 'Bạn có chắc chắn muốn thực hiện hành động này không?'
                          : 'Are you sure you want to perform this action?'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline">
                        {language === Language.VIETNAMESE ? 'Hủy' : 'Cancel'}
                      </Button>
                      <Button>
                        {language === Language.VIETNAMESE ? 'Xác nhận' : 'Confirm'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sheet</CardTitle>
              </CardHeader>
              <CardContent>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="w-full">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>
                        {language === Language.VIETNAMESE ? 'Cài đặt nhanh' : 'Quick Settings'}
                      </SheetTitle>
                      <SheetDescription>
                        {language === Language.VIETNAMESE 
                          ? 'Điều chỉnh các tùy chọn của bạn'
                          : 'Adjust your preferences'
                        }
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <Label>Notifications</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Dark Mode</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto Save</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}