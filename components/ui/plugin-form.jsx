"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Save, MessageSquare, Brain, Info, FileText, AlertTriangle, Link, Upload } from 'lucide-react'
import { useState, useCallback, React } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
// import { siGithub } from 'simple-icons'
import Image from "next/image"


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

// Move ExternalIntegrationFields outside of PluginWizard
const ExternalIntegrationFields = ({ pluginData, onFieldChange }) => (
  <div className="space-y-4">
    <Label className="font-semibold">External Integration Settings</Label>
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="triggers_on">Triggers On</Label>
        <Select
          value={pluginData.external_integration.triggers_on}
          onValueChange={(value) => onFieldChange('triggers_on', value)}
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
          onChange={(e) => onFieldChange('webhook_url', e.target.value)}
          placeholder="https://your-webhook-url.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="setup_completed_url">Setup Completed URL</Label>
        <Input
          id="setup_completed_url"
          name="setup_completed_url"
          value={pluginData.external_integration.setup_completed_url}
          onChange={(e) => onFieldChange('setup_completed_url', e.target.value)}
          placeholder="https://your-setup-completed-url.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="setup_instructions_file_path">Setup Instructions File Path</Label>
        <Input
          id="setup_instructions_file_path"
          name="setup_instructions_file_path"
          value={pluginData.external_integration.setup_instructions_file_path}
          onChange={(e) => onFieldChange('setup_instructions_file_path', e.target.value)}
          placeholder="/plugins/instructions/your-plugin/README.md"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="setup_instructions">Setup Instructions (Markdown)</Label>
        <Textarea
          id="setup_instructions"
          name="setup_instructions"
          value={pluginData.external_integration.setup_instructions || ''}
          onChange={(e) => onFieldChange('setup_instructions', e.target.value)}
          placeholder="# Setup Instructions\n\nProvide detailed setup instructions in markdown format..."
          className="min-h-[200px] font-mono"
        />
      </div>
    </div>
  </div>
);

const PluginWizard = () => {
  // const [isAuthenticated] = useState(false);  // Add this state
  const [setupInstructions, setSetupInstructions] = useState('');
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
      setup_instructions: '',
      auth_steps: []
    }
  });
  const [jsonOutput, setJsonOutput] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPluginData(prev => {
      const updates = { [name]: value };

      // Automatically generate ID when name changes
      if (name === 'name') {
        updates.id = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-')         // Replace spaces with dashes
          .replace(/-+/g, '-')          // Replace multiple dashes with single dash
          .trim();
      }

      return { ...prev, ...updates };
    });
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
    setSetupInstructions(pluginData.external_integration.setup_instructions);
    if (pluginData.capabilities.length === 0) {
      setErrors(prev => ({ ...prev, capabilities: 'Please select at least one capability.' }));
      return;
    }
    if (Object.keys(errors).length > 0) {
      alert("Please correct all errors before generating JSON.");
      return;
    }

    const outputData = {
      ...pluginData,
      image: `/plugins/logos/${pluginData.image}`
    };

    // Remove setup instructions from JSON output
    if (outputData.external_integration) {
      delete outputData.external_integration.setup_instructions;
    }

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
    console.log('JSON Output:', JSON.stringify(outputData, null, 2));
  };

  const handleExternalIntegrationChange = useCallback((field, value) => {
    setPluginData(prev => ({
      ...prev,
      external_integration: {
        ...prev.external_integration,
        [field]: field === 'setup_completed_url' && value.trim() === '' ? null : value
      }
    }));
  }, []);

  // const handleGitHubLogin = () => {
  //   // Add GitHub login logic here later
  //   console.log('GitHub login clicked');
  // };

  // Add this function to handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check for spaces in filename
      if (file.name.includes(' ')) {
        setErrors(prev => ({
          ...prev,
          image: 'Image filename cannot contain spaces. Please rename the file and try again.'
        }));
        e.target.value = ''; // Reset the input
        return;
      }

      // Check file extension
      if (!/\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
        setErrors(prev => ({
          ...prev,
          image: 'Image must be a .jpg, .jpeg, .png, or .gif file'
        }));
        e.target.value = ''; // Reset the input
        return;
      }

      setPluginData(prev => ({ ...prev, image: file.name }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const handleSendToTeam = async () => {
    const fileInput = document.getElementById('image');
    const file = fileInput?.files[0];

    const formData = new FormData();

    // Create plugin data
    const pluginDataToSend = {
      ...pluginData,
      image: `/plugins/logos/${pluginData.image}`,
      email: pluginData.email  // Include email in plugin data
    };

    // Remove capabilities that aren't enabled
    if (!pluginData.capabilities.includes('chat')) {
      delete pluginDataToSend.chat_prompt;
    }
    if (!pluginData.capabilities.includes('memories')) {
      delete pluginDataToSend.memory_prompt;
    }
    if (!pluginData.capabilities.includes('external_integration')) {
      delete pluginDataToSend.external_integration;
    }

    // Append data to formData
    formData.append('pluginData', JSON.stringify(pluginDataToSend));
    formData.append('pluginInstructions', setupInstructions);
    formData.append('userEmail', pluginData.email); // Add email separately
    if (file) {
      formData.append('pluginLogo', file);
    }

    const response = await fetch('/api/send-email', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      window.location.href = '/success';
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black-800 p-4 md:p-8">
      <Card className="w-full max-w-4xl">

        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-center">
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/omi-black.webp"
                alt="OMI"
                width={100}
                height={44}
              />
              <span>Plugin Creator - Plugins made easy!</span>
            </div>
          </CardTitle>
          {/* {!isAuthenticated && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                className="bg-[#24292e] text-white hover:bg-[#1c2024] border-[#24292e] hover:border-[#1c2024] transition-all duration-200 ease-in-out flex items-center justify-center gap-3 py-5 px-6 text-base font-medium rounded-full shadow-sm hover:shadow-md"
                onClick={handleGitHubLogin}
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d={siGithub.path} />
                </svg>
                <span>Continue with GitHub</span>
              </Button>
            </div>
          )} */}
        </CardHeader>

        <CardContent className="space-y-6 p-4 md:p-6">
          {/* <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded text-sm md:text-base" role="alert">
            <p className="font-bold">Important Note:</p>
            <p>This tool is designed to generate the JSON file for your plugin. Once you have generated the JSON, you still need to follow the directions on the link below to submit it for approval.</p>
            <a href="https://docs.omi.me/docs/developer/apps/Submitting" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center mt-2">
              View full documentation
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div> */}

          <div className="space-y-4">
            <Label className="font-semibold text-lg">Capabilities</Label>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="w-full md:flex-1 bg-blue-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
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
              <div className="w-full md:flex-1 bg-purple-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
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
              <div className="w-full md:flex-1 bg-green-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
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

          {pluginData.capabilities.includes('external_integration') && (
            <ExternalIntegrationFields
              pluginData={pluginData}
              onFieldChange={handleExternalIntegrationChange}
            />
          )}

          <div className="space-y-4">
            <Label className="font-semibold">Plugin Metadata</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span>Plugin Name</span>
                </Label>
                <Input id="name" name="name" value={pluginData.name} onChange={handleInputChange} placeholder="Your Plugin Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id" className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <span>Plugin ID</span>
                </Label>
                <Input
                  id="id"
                  name="id"
                  value={pluginData.id}
                  readOnly
                  className="bg-gray-100"
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={pluginData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
                  <Upload className="w-5 h-5 text-red-500" />
                  <span>Plugin Logo</span>
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
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

          <div className="flex justify-center">
            <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-8">
              <Save className="mr-2 h-5 w-5" /> Generate JSON
            </Button>
          </div>

          {jsonOutput && (
            <div className="mt-6 space-y-4">
              <Label className="font-semibold">JSON Output</Label>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {jsonOutput}
              </pre>
              <div className="flex justify-center">
                <Button
                  onClick={handleSendToTeam} // Call the send function
                  className="bg-green-500 hover:bg-green-600 text-white px-8"
                >
                  <MessageSquare className="mr-2 h-5 w-5" /> Send Plugin to Team
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginWizard;
