"use client";

import React, { useState } from 'react';
import { Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentGroupService } from "@/service/agent-groups";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteAgentGroupProps {
  groupId: string;
  groupName: string;
  onDeleteSuccess?: () => void;
}

const DeleteAgentGroup: React.FC<DeleteAgentGroupProps> = ({
  groupId,
  groupName,
  onDeleteSuccess,
}) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteGroup = async () => {
    if (!groupId) {
      toast.error("No agent group selected");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await AgentGroupService.deleteAgentGroup(groupId);

      if (response.status === 204 || response.status === 200) {
        toast.success("Agent group deleted successfully!");

        // Invalidate and refetch agent groups to update the cache
        await queryClient.invalidateQueries({ queryKey: ["agent-groups"] });

        // Call the callback to navigate back to agent groups
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        toast.error(response.error || "Failed to delete agent group");
      }
    } catch (error) {
      console.error("Error deleting agent group:", error);
      toast.error("An error occurred while deleting the agent group");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="bg-card border border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive font-medium">
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Deleting this agent group will permanently remove all agents, configurations, and chat history associated with it.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                size="lg"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash size={16} className="mr-2" />
                    Delete Agent Group
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the agent group
                  <strong className="text-foreground"> "{groupName}"</strong> and remove all associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteGroup}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeleteAgentGroup;
