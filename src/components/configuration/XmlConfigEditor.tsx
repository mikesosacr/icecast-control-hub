
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface XmlConfigEditorProps {
  xmlConfig: string;
  isUpdating: boolean;
  onSave: (xmlConfig: string) => void;
}

export const XmlConfigEditor = ({ xmlConfig, isUpdating, onSave }: XmlConfigEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localXmlConfig, setLocalXmlConfig] = useState(xmlConfig);
  const [xmlBackup, setXmlBackup] = useState("");

  const handleEdit = () => {
    setXmlBackup(localXmlConfig);
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(localXmlConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalXmlConfig(xmlBackup);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>icecast.xml</CardTitle>
        <CardDescription>
          Edit the raw XML configuration file for your Icecast server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Textarea 
              value={localXmlConfig}
              onChange={(e) => setLocalXmlConfig(e.target.value)}
              className="min-h-[60vh] font-mono text-sm whitespace-pre"
              disabled={!isEditing}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>Cancel</Button>
                <Button onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>Edit Configuration</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
