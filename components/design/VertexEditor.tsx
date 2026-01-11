/**
 * Vertex Editor Component
 * Enables precise editing of corners, edges, and faces of 3D objects
 */

"use client";

import { useState } from 'react';
import { Vector3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';

export interface Vertex {
  id: string;
  position: [number, number, number];
}

export interface Edge {
  id: string;
  start: number; // Vertex index
  end: number; // Vertex index
}

interface VertexEditorProps {
  vertices: Vertex[];
  edges?: Edge[];
  onVertexMove: (vertexId: string, newPosition: [number, number, number]) => void;
  onEdgeMove?: (edgeId: string, delta: [number, number, number]) => void;
  showVertices?: boolean;
  showEdges?: boolean;
  vertexSize?: number;
  edgeThickness?: number;
}

export function VertexEditor({
  vertices,
  edges = [],
  onVertexMove,
  onEdgeMove,
  showVertices = true,
  showEdges = true,
  vertexSize = 0.15,
  edgeThickness = 0.05,
}: VertexEditorProps) {
  const [hoveredVertex, setHoveredVertex] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [draggingVertex, setDraggingVertex] = useState<string | null>(null);

  const handleVertexDragStart = (vertexId: string, event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setDraggingVertex(vertexId);
  };

  const handleVertexDrag = (vertexId: string, event: ThreeEvent<PointerEvent>) => {
    if (draggingVertex !== vertexId) return;
    event.stopPropagation();

    const newPosition: [number, number, number] = [
      event.point.x,
      event.point.y,
      event.point.z,
    ];

    onVertexMove(vertexId, newPosition);
  };

  const handleVertexDragEnd = () => {
    setDraggingVertex(null);
  };

  return (
    <group>
      {/* Render edges */}
      {showEdges && edges.map((edge) => {
        const startVertex = vertices[edge.start];
        const endVertex = vertices[edge.end];
        if (!startVertex || !endVertex) return null;

        const start = new Vector3(...startVertex.position);
        const end = new Vector3(...endVertex.position);
        const mid = new Vector3().addVectors(start, end).multiplyScalar(0.5);
        const direction = new Vector3().subVectors(end, start);
        const length = direction.length();

        // Calculate rotation to align with edge
        const up = new Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          up,
          direction.normalize()
        );
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        return (
          <mesh
            key={edge.id}
            position={[mid.x, mid.y, mid.z]}
            rotation={[euler.x, euler.y, euler.z]}
            onPointerEnter={() => setHoveredEdge(edge.id)}
            onPointerLeave={() => setHoveredEdge(null)}
          >
            <cylinderGeometry args={[edgeThickness, edgeThickness, length, 8]} />
            <meshBasicMaterial
              color={hoveredEdge === edge.id ? '#ffff00' : '#00ffff'}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Render vertices */}
      {showVertices && vertices.map((vertex) => (
        <mesh
          key={vertex.id}
          position={vertex.position}
          onPointerDown={(e) => handleVertexDragStart(vertex.id, e)}
          onPointerMove={(e) => handleVertexDrag(vertex.id, e)}
          onPointerUp={handleVertexDragEnd}
          onPointerEnter={() => setHoveredVertex(vertex.id)}
          onPointerLeave={() => setHoveredVertex(null)}
        >
          <sphereGeometry args={[vertexSize, 16, 16]} />
          <meshBasicMaterial
            color={
              draggingVertex === vertex.id
                ? '#00ff00'
                : hoveredVertex === vertex.id
                ? '#ffff00'
                : '#ff0000'
            }
          />
        </mesh>
      ))}
    </group>
  );
}

// Helper function to generate vertices from a box
export function generateBoxVertices(
  centerPos: [number, number, number],
  width: number,
  height: number,
  depth: number
): Vertex[] {
  const [cx, cy, cz] = centerPos;
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  return [
    // Bottom vertices
    { id: 'v0', position: [cx - hw, cy - hh, cz - hd] as [number, number, number] },
    { id: 'v1', position: [cx + hw, cy - hh, cz - hd] as [number, number, number] },
    { id: 'v2', position: [cx + hw, cy - hh, cz + hd] as [number, number, number] },
    { id: 'v3', position: [cx - hw, cy - hh, cz + hd] as [number, number, number] },
    // Top vertices
    { id: 'v4', position: [cx - hw, cy + hh, cz - hd] as [number, number, number] },
    { id: 'v5', position: [cx + hw, cy + hh, cz - hd] as [number, number, number] },
    { id: 'v6', position: [cx + hw, cy + hh, cz + hd] as [number, number, number] },
    { id: 'v7', position: [cx - hw, cy + hh, cz + hd] as [number, number, number] },
  ];
}

// Helper function to generate edges for a box
export function generateBoxEdges(): Edge[] {
  return [
    // Bottom edges
    { id: 'e0', start: 0, end: 1 },
    { id: 'e1', start: 1, end: 2 },
    { id: 'e2', start: 2, end: 3 },
    { id: 'e3', start: 3, end: 0 },
    // Top edges
    { id: 'e4', start: 4, end: 5 },
    { id: 'e5', start: 5, end: 6 },
    { id: 'e6', start: 6, end: 7 },
    { id: 'e7', start: 7, end: 4 },
    // Vertical edges
    { id: 'e8', start: 0, end: 4 },
    { id: 'e9', start: 1, end: 5 },
    { id: 'e10', start: 2, end: 6 },
    { id: 'e11', start: 3, end: 7 },
  ];
}

// Calculate dimensions from vertices
export function calculateDimensionsFromVertices(vertices: Vertex[]): {
  width: number;
  height: number;
  depth: number;
  center: [number, number, number];
} {
  if (vertices.length === 0) {
    return { width: 0, height: 0, depth: 0, center: [0, 0, 0] };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  vertices.forEach((v) => {
    minX = Math.min(minX, v.position[0]);
    maxX = Math.max(maxX, v.position[0]);
    minY = Math.min(minY, v.position[1]);
    maxY = Math.max(maxY, v.position[1]);
    minZ = Math.min(minZ, v.position[2]);
    maxZ = Math.max(maxZ, v.position[2]);
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
  };
}
