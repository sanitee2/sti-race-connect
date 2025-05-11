import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function ParticipantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
        <p className="text-muted-foreground">
          Manage runners participating in your events.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search participants..." className="pl-8" />
        </div>
        <Button>Export List</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Bib Number</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{participant.name}</TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell>{participant.event}</TableCell>
                <TableCell>{participant.bibNumber}</TableCell>
                <TableCell>
                  <Badge variant={participant.status === "Checked In" ? "default" : 
                                   participant.status === "DNS" ? "destructive" : "outline"}>
                    {participant.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const participants = [
  {
    name: "Alex Johnson",
    email: "alex@example.com",
    event: "STI Marathon 2024",
    bibNumber: "A001",
    status: "Registered"
  },
  {
    name: "Sarah Miller",
    email: "sarah@example.com",
    event: "STI Marathon 2024",
    bibNumber: "A002",
    status: "Checked In"
  },
  {
    name: "David Wilson",
    email: "david@example.com",
    event: "Charity 5K Run",
    bibNumber: "B045",
    status: "Registered"
  },
  {
    name: "Emma Thompson",
    email: "emma@example.com",
    event: "Corporate Challenge",
    bibNumber: "C112",
    status: "DNS"
  },
  {
    name: "Michael Brown",
    email: "michael@example.com",
    event: "STI Marathon 2024",
    bibNumber: "A015",
    status: "Checked In"
  }
]; 