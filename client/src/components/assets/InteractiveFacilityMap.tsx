
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/eams";
import * as THREE from 'three';

interface InteractiveFacilityMapProps {
  equipment: Equipment[];
}

const AssetPin = ({ asset, position, onClick }: { 
  asset: Equipment; 
  position: [number, number, number]; 
  onClick: (asset: Equipment) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#22c55e';
      case 'maintenance': return '#eab308';
      case 'fault': return '#ef4444';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={hovered ? 1.5 : 1}
        onClick={() => onClick(asset)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
        <meshStandardMaterial color={getStatusColor(asset.status)} />
      </mesh>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-white p-2 rounded shadow-lg border text-sm max-w-48">
            <div className="font-medium">{asset.name}</div>
            <div className="text-muted-foreground">{asset.location.building}</div>
            <Badge className="mt-1" variant="secondary">
              {asset.status}
            </Badge>
          </div>
        </Html>
      )}
    </group>
  );
};

const FacilityBuilding = ({ position, size, name }: {
  position: [number, number, number];
  size: [number, number, number];
  name: string;
}) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.7} />
      </mesh>
      <Text
        position={[0, size[1] / 2 + 1, 0]}
        fontSize={1}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

export function InteractiveFacilityMap({ equipment }: InteractiveFacilityMapProps) {
  const [selectedAsset, setSelectedAsset] = useState<Equipment | null>(null);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');

  const assetPositions = useMemo(() => {
    return equipment.map((asset, index) => {
      // Generate positions based on building/room data
      const baseX = (index % 5) * 8 - 16;
      const baseZ = Math.floor(index / 5) * 8 - 16;
      const y = viewMode === '3D' ? 1 : 0;
      
      return {
        asset,
        position: [baseX, y, baseZ] as [number, number, number]
      };
    });
  }, [equipment, viewMode]);

  const buildings = [
    { position: [-10, 0, -10] as [number, number, number], size: [15, 8, 15] as [number, number, number], name: "Pump House A" },
    { position: [10, 0, -10] as [number, number, number], size: [12, 6, 12] as [number, number, number], name: "Control Room" },
    { position: [0, 0, 10] as [number, number, number], size: [20, 4, 10] as [number, number, number], name: "Maintenance Bay" },
  ];

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interactive Facility Map</CardTitle>
            <CardDescription>3D visualization of asset locations and facility layout</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === '2D' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('2D')}
            >
              2D View
            </Button>
            <Button
              variant={viewMode === '3D' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('3D')}
            >
              3D View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[500px]">
        <div className="flex h-full gap-4">
          <div className="flex-1">
            <Canvas
              camera={{ 
                position: viewMode === '3D' ? [30, 25, 30] : [0, 50, 0],
                fov: 60 
              }}
              style={{ background: '#f8fafc' }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 20, 5]} intensity={1} />
              <pointLight position={[0, 10, 0]} intensity={0.5} />

              {/* Ground plane */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#d1d5db" />
              </mesh>

              {/* Facility buildings */}
              {buildings.map((building, index) => (
                <FacilityBuilding
                  key={index}
                  position={building.position}
                  size={building.size}
                  name={building.name}
                />
              ))}

              {/* Asset pins */}
              {assetPositions.map(({ asset, position }, index) => (
                <AssetPin
                  key={asset.id}
                  asset={asset}
                  position={position}
                  onClick={setSelectedAsset}
                />
              ))}

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={viewMode === '3D'}
                maxPolarAngle={viewMode === '3D' ? Math.PI / 2 : 0}
                minPolarAngle={viewMode === '3D' ? 0 : 0}
              />
            </Canvas>
          </div>

          {selectedAsset && (
            <div className="w-80 p-4 bg-muted/20 rounded-lg">
              <h3 className="font-semibold mb-2">Asset Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedAsset.name}
                </div>
                <div>
                  <span className="font-medium">ID:</span> {selectedAsset.id}
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className="ml-2" variant="secondary">
                    {selectedAsset.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Location:</span> {selectedAsset.location.building}
                </div>
                <div>
                  <span className="font-medium">Manufacturer:</span> {selectedAsset.manufacturer}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {selectedAsset.model}
                </div>
                {selectedAsset.location.coordinates && (
                  <div>
                    <span className="font-medium">Coordinates:</span>
                    <div className="text-xs text-muted-foreground">
                      Lat: {selectedAsset.location.coordinates.latitude.toFixed(6)}
                      <br />
                      Lng: {selectedAsset.location.coordinates.longitude.toFixed(6)}
                    </div>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                className="mt-4 w-full"
                onClick={() => setSelectedAsset(null)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
