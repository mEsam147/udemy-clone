// components/webhook-status.tsx
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface WebhookEvent {
  id: string;
  type: string;
  status: "success" | "failed" | "pending";
  timestamp: Date;
  sessionId?: string;
  error?: string;
}

export function WebhookStatusMonitor() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWebhookEvents = async () => {
    setLoading(true);
    try {
      // This would call your API to get recent webhook events
      const response = await fetch('/api/admin/webhook-events');
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch webhook events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookEvents();
    // Set up real-time updates with WebSocket or polling
    const interval = setInterval(fetchWebhookEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: WebhookEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: WebhookEvent['status']) => {
    switch (status) {
      case 'success':
        return "default";
      case 'failed':
        return "destructive";
      case 'pending':
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhook Events</CardTitle>
            <CardDescription>
              Real-time monitoring of payment webhook events
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWebhookEvents}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(event.status)}
                <div>
                  <p className="font-medium text-sm">{event.type}</p>
                  {event.sessionId && (
                    <p className="text-xs text-muted-foreground">
                      Session: {event.sessionId.slice(0, 8)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusVariant(event.status)}>
                  {event.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No webhook events found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}