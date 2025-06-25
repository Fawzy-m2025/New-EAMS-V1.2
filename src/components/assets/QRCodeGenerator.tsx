
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Equipment } from "@/types/eams";
import { Download, Printer, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  asset: Equipment;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeGenerator({ asset, isOpen, onClose }: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const [qrSize, setQrSize] = useState(256);
  const [includeDetails, setIncludeDetails] = useState(true);
  
  const qrData = JSON.stringify({
    id: asset.id,
    name: asset.name,
    assetTag: asset.assetTag,
    manufacturer: asset.manufacturer,
    model: asset.model,
    location: asset.location,
    timestamp: new Date().toISOString()
  });

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = qrSize;
    canvas.height = qrSize;
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `${asset.assetTag || asset.id}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const printQR = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow) return;

    const qrElement = document.getElementById('qr-code-container');
    if (!qrElement) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${asset.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .asset-label {
              border: 2px solid #000;
              padding: 20px;
              margin: 20px auto;
              width: fit-content;
              background: white;
            }
            .qr-container { margin: 20px 0; }
            .asset-info { margin-top: 10px; font-size: 12px; }
            .asset-info div { margin: 2px 0; }
          </style>
        </head>
        <body>
          <div class="asset-label">
            <div class="qr-container">${qrElement.innerHTML}</div>
            ${includeDetails ? `
              <div class="asset-info">
                <div><strong>${asset.name}</strong></div>
                <div>ID: ${asset.id}</div>
                <div>Tag: ${asset.assetTag || 'N/A'}</div>
                <div>Model: ${asset.manufacturer} ${asset.model}</div>
                <div>Location: ${asset.location.building}</div>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData).then(() => {
      toast({
        title: "Copied!",
        description: "QR code data copied to clipboard.",
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>QR Code Generator - {asset.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center" id="qr-code-container">
                <QRCode
                  id="qr-code"
                  value={qrData}
                  size={qrSize}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
                
                {includeDetails && (
                  <div className="mt-4 text-sm space-y-1">
                    <div className="font-medium">{asset.name}</div>
                    <div>ID: {asset.id}</div>
                    <div>Tag: {asset.assetTag || 'N/A'}</div>
                    <div>Model: {asset.manufacturer} {asset.model}</div>
                    <div>Location: {asset.location.building}</div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex gap-2">
              <Button onClick={downloadQR} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={printQR} variant="outline" className="flex-1 gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button onClick={copyQRData} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Data
              </Button>
            </div>
          </div>
          
          {/* Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="qr-size">QR Code Size</Label>
              <Input
                id="qr-size"
                type="number"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                min="128"
                max="512"
                step="32"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Size in pixels (128-512)
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="include-details"
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="include-details">Include asset details in printable label</Label>
            </div>
            
            <div className="space-y-2">
              <Label>QR Code Data Preview</Label>
              <div className="p-3 bg-muted rounded-md text-xs">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(JSON.parse(qrData), null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Scanning Instructions</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Use any QR code scanner app</p>
                <p>• Or use device camera (iOS/Android)</p>
                <p>• Data includes asset ID, location, and specs</p>
                <p>• Perfect for maintenance tracking</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
