// components/admin/ContactManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Trash2, Eye } from "lucide-react";
import { contactService, Contact, ContactStats } from "@/services/contact.service";

export function ContactManagement() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
    loadStats();
  }, []);

  const loadContacts = async () => {
    try {
      const result = await contactService.getContacts();
      setContacts(result.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await contactService.getContactStats();
      setStats(result.data || null);
    } catch (error) {
      console.error('Failed to load contact stats');
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      await contactService.deleteContact(contactId);
      setContacts(contacts.filter(contact => contact._id !== contactId));
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-muted-foreground">New</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.read}</div>
              <div className="text-sm text-muted-foreground">Read</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.replied}</div>
              <div className="text-sm text-muted-foreground">Replied</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-semibold">{contact.name}</span>
                    <span className="text-muted-foreground">{contact.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={
                      contact.status === 'new' ? 'default' :
                      contact.status === 'read' ? 'secondary' : 'outline'
                    }>
                      {contact.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteContact(contact._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mb-2">
                  <strong>Subject:</strong> {contact.subject}
                </div>
                <div className="text-sm text-muted-foreground">
                  {contact.message}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}