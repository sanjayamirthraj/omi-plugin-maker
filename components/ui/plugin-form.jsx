"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Save, MessageSquare, Brain, Info, FileText, Image, ExternalLink, AlertTriangle, Link } from 'lucide-react'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

const PromptInfo = ({ icon, title, description, example }) => (
  <div className="bg-gray-100 p-4 rounded-lg space-y-2">
    <div className="flex items-center space-x-2">
      {icon}
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
    <div className="bg-white p-2 rounded border border-gray-200">
      <p className="text-sm font-medium text-gray-500">Example:</p>
      <p className="text-sm italic text-gray-400">{example}</p>
    </div>
  </div>
);

const PluginWizard = () => {
  const [pluginData, setPluginData] = useState({
    id: '',
    name: '',
    author: '',
    description: '',
    image: '',
    memories: false,
    chat: false,
    capabilities: [],
    chat_prompt: '',
    memory_prompt: '',
    deleted: false,
    external_integration: {
      triggers_on: 'memory_creation',
      webhook_url: '',
      setup_completed_url: 'null',
      setup_instructions_file_path: '',
      auth_steps: []
    }
  });
  const [jsonOutput, setJsonOutput] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPluginData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case 'id':
        if (!/^[a-z0-9-]+$/.test(value)) {
          newErrors.id = 'Plugin ID must contain only lowercase letters, numbers, and dashes.';
        } else {
          delete newErrors.id;
        }
        break;
      case 'image':
        if (!/\.(jpg|jpeg|png|gif)$/i.test(value)) {
          newErrors.image = 'Image filename must end with .jpg, .jpeg, .png, or .gif';
        } else {
          delete newErrors.image;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleCapabilityChange = (capability) => {
    setPluginData(prev => {
      const newCapabilities = prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability];

      return {
        ...prev,
        capabilities: newCapabilities,
        [capability]: !prev[capability]
      };
    });
  };

  const handleSave = () => {
    if (pluginData.capabilities.length === 0) {
      setErrors(prev => ({ ...prev, capabilities: 'Please select at least one capability.' }));
      return;
    }
    if (Object.keys(errors).length > 0) {
      alert("Please correct all errors before generating JSON.");
      return;
    }

    // Create a copy of the plugin data
    const outputData = {
      ...pluginData,
      image: `/plugins/logos/${pluginData.image}`
    };

    if (!pluginData.capabilities.includes('chat')) {
      delete outputData.chat_prompt;
    }
    if (!pluginData.capabilities.includes('memories')) {
      delete outputData.memory_prompt;
    }
    if (!pluginData.capabilities.includes('external_integration')) {
      delete outputData.external_integration;
    }

    setJsonOutput(JSON.stringify(outputData, null, 2));
  };

  const ExternalIntegrationFields = () => (
    <div className="space-y-4">
      <Label className="font-semibold">External Integration Settings</Label>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="triggers_on">Triggers On</Label>
          <Select
            value={pluginData.external_integration.triggers_on}
            onValueChange={(value) => handleExternalIntegrationChange('triggers_on', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select trigger event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="memory_creation">Memory Creation</SelectItem>
              <SelectItem value="transcript_processed">Transcript Processed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhook_url">Webhook URL</Label>
          <Input
            id="webhook_url"
            name="webhook_url"
            value={pluginData.external_integration.webhook_url}
            onChange={(e) => handleExternalIntegrationChange('webhook_url', e.target.value)}
            placeholder="https://your-webhook-url.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup_completed_url">Setup Completed URL (Optional)</Label>
          <Input
            id="setup_completed_url"
            name="setup_completed_url"
            value={pluginData.external_integration.setup_completed_url}
            onChange={(e) => handleExternalIntegrationChange('setup_completed_url', e.target.value)}
            placeholder="https://your-setup-completed-url.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup_instructions_file_path">Setup Instructions File Path</Label>
          <Input
            id="setup_instructions_file_path"
            name="setup_instructions_file_path"
            value={pluginData.external_integration.setup_instructions_file_path}
            onChange={(e) => handleExternalIntegrationChange('setup_instructions_file_path', e.target.value)}
            placeholder="/plugins/instructions/your-plugin/README.md"
          />
        </div>
      </div>
    </div>
  );

  // Add this new handler
  const handleExternalIntegrationChange = (field, value) => {
    setPluginData(prev => ({
      ...prev,
      external_integration: {
        ...prev.external_integration,
        [field]: field === 'setup_completed_url' && value.trim() === '' ? null : value
      }
    }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <Card className="w-full max-w-4xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">OMI Plugin Creator - Plugins made easy!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
            <p className="font-bold">Important Note:</p>
            <p>This tool is designed to generate the JSON file for your plugin. Once you have generated the JSON, you still need to follow the directions on the link below to submit it for approval.</p>
            <a href="https://docs.omi.me/docs/developer/apps/Submitting" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center mt-2">
              View full documentation
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="space-y-4">
            <Label className="font-semibold text-lg">Capabilities</Label>
            <div className="flex space-x-4">
              <div className="flex-1 bg-blue-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chat"
                    checked={pluginData.chat}
                    onCheckedChange={() => handleCapabilityChange('chat')}
                    className="w-6 h-6"
                  />
                  <Label htmlFor="chat" className="flex items-center space-x-2 cursor-pointer">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                    <span className="text-lg font-medium">Chat</span>
                  </Label>
                </div>
              </div>
              <div className="flex-1 bg-purple-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="memories"
                    checked={pluginData.memories}
                    onCheckedChange={() => handleCapabilityChange('memories')}
                    className="w-6 h-6"
                  />
                  <Label htmlFor="memories" className="flex items-center space-x-2 cursor-pointer">
                    <Brain className="w-8 h-8 text-purple-500" />
                    <span className="text-lg font-medium">Memories</span>
                  </Label>
                </div>
              </div>
              <div className="flex-1 bg-green-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="external_integration"
                    checked={pluginData.capabilities.includes('external_integration')}
                    onCheckedChange={() => handleCapabilityChange('external_integration')}
                    className="w-6 h-6"
                  />
                  <Label htmlFor="external_integration" className="flex items-center space-x-2 cursor-pointer">
                    <Link className="w-8 h-8 text-green-500" />
                    <span className="text-lg font-medium">External Integration</span>
                  </Label>
                </div>
              </div>
            </div>
            {errors.capabilities && (
              <div className="text-red-500 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {errors.capabilities}
              </div>
            )}
          </div>

          {pluginData.chat && (
            <div className="space-y-4">
              <Label htmlFor="chat_prompt" className="font-semibold">Chat Prompt</Label>
              <PromptInfo
                icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
                title="Chat Prompts"
                description="Alter FRIEND's conversational style and knowledge base."
                example="Create a plugin that makes FRIEND communicate like a specific expert or professional in a given field."
              />
              <div className="border-2 border-blue-300 rounded-md p-2 bg-blue-50">
                <Label htmlFor="chat_prompt" className="text-blue-700 font-medium mb-2 block">Enter your chat prompt here:</Label>
                <Textarea
                  id="chat_prompt"
                  name="chat_prompt"
                  value={pluginData.chat_prompt}
                  onChange={handleInputChange}
                  placeholder="Your chat prompt here"
                  className="w-full h-32 border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {pluginData.memories && (
            <div className="space-y-4">
              <Label htmlFor="memory_prompt" className="font-semibold">Memory Prompt</Label>
              <PromptInfo
                icon={<Brain className="w-5 h-5 text-purple-500" />}
                title="Memory Prompts"
                description="Analyze conversations and extract specific information based on predefined criteria."
                example="Use for summarization, key point extraction, or identifying action items from discussions."
              />
              <div className="border-2 border-purple-300 rounded-md p-2 bg-purple-50">
                <Label htmlFor="memory_prompt" className="text-purple-700 font-medium mb-2 block">Enter your memory prompt here:</Label>
                <Textarea
                  id="memory_prompt"
                  name="memory_prompt"
                  value={pluginData.memory_prompt}
                  onChange={handleInputChange}
                  placeholder="Your memory prompt here"
                  className="w-full h-32 border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {pluginData.capabilities.includes('external_integration') && <ExternalIntegrationFields />}

          <div className="space-y-4">
            <Label className="font-semibold">Plugin Metadata</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id" className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <span>Plugin ID</span>
                </Label>
                <Input id="id" name="id" value={pluginData.id} onChange={handleInputChange} placeholder="your-plugin-id" />
                {errors.id && <p className="text-red-500 text-sm">{errors.id}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span>Plugin Name</span>
                </Label>
                <Input id="name" name="name" value={pluginData.name} onChange={handleInputChange} placeholder="Your Plugin Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author" className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-purple-500" />
                  <span>Author Name</span>
                </Label>
                <Input id="author" name="author" value={pluginData.author} onChange={handleInputChange} placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center space-x-2">
                  <Image className="w-5 h-5 text-red-500" />
                  <span>Image Filename</span>
                </Label>
                <Input id="image" name="image" value={pluginData.image} onChange={handleInputChange} placeholder="your-plugin-logo.jpg" />
                {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-yellow-500" />
                <span>Description</span>
              </Label>
              <Textarea id="description" name="description" value={pluginData.description} onChange={handleInputChange} placeholder="A brief description of what your plugin does" />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            <Save className="mr-2 h-5 w-5" /> Generate JSON
          </Button>

          {jsonOutput && (
            <div className="mt-6 space-y-4">
              <Label className="font-semibold">JSON Output</Label>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                {jsonOutput}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginWizard;