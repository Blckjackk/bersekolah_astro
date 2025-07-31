"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function KelolaHalamanPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Halaman</h1>
          <p className="text-muted-foreground">
            Kelola halaman dan konten website
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Pengaturan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Halaman Website</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur kelola halaman sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
