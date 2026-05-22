import { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Key, Shield, Bell, Heart, Search, 
  DollarSign, Calendar, Settings, Trash2, CreditCard,
  Home, TrendingUp, CheckCircle, XCircle, Clock, Edit2, Plus,
  Camera, Globe, Link as LinkIcon, ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { AppNavigator } from './AppNavigator';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user data
  const userData = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+61 412 345 678',
    city: 'Sydney',
    timezone: 'Australia/Sydney',
    accountSource: 'Google',
    emailVerified: true,
    twoFactorEnabled: false,
  };

  return (
    <div className="relative z-10 min-h-screen">
      <header className="px-4 py-5 md:px-7">
        <div>
          <AppNavigator />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[32px] border border-white/70 bg-white/72 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h1 className="mb-2 text-gray-900">Account Settings</h1>
                <p className="text-sm text-gray-600">Manage your profile and preferences</p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === 'profile'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === 'preferences'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === 'saved'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  Saved & Alerts
                </button>
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === 'finance'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  Finance
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === 'activities'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Activities
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === 'account'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Account
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === 'billing'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Billing
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Profile Photo & Basic Info */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Personal Information</CardTitle>
                    <CardDescription className="text-gray-600">Update your personal details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 text-gray-900">
                          <span className="text-2xl">JS</span>
                        </div>
                        <button className="absolute bottom-0 right-0 rounded-full bg-gray-900 p-2 text-white shadow-lg transition hover:bg-gray-800">
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="mb-1 text-gray-900">{userData.firstName} {userData.lastName}</h3>
                        <p className="mb-2 text-sm text-gray-600">{userData.email}</p>
                        <Button variant="outline" size="sm" className="rounded-lg border-gray-300 text-gray-900 hover:bg-gray-50">
                          Change Photo
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-xs uppercase tracking-[0.35em] text-gray-500">First Name</Label>
                        <Input
                          id="firstName"
                          defaultValue={userData.firstName}
                          className="border-gray-300 bg-white text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-xs uppercase tracking-[0.35em] text-gray-500">Last Name</Label>
                        <Input
                          id="lastName"
                          defaultValue={userData.lastName}
                          className="border-gray-300 bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs uppercase tracking-[0.35em] text-gray-500">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          defaultValue={userData.email}
                          className="border-gray-300 bg-white pl-10 text-gray-900"
                        />
                        {userData.emailVerified && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs uppercase tracking-[0.35em] text-gray-500">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          defaultValue={userData.phone}
                          placeholder="+61 4XX XXX XXX"
                          className="border-gray-300 bg-white pl-10 text-gray-900"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Used for SMS verification and property alerts</p>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs uppercase tracking-[0.35em] text-gray-500">City</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="city"
                            defaultValue={userData.city}
                            className="border-gray-300 bg-white pl-10 text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-xs uppercase tracking-[0.35em] text-gray-500">Timezone</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Select defaultValue={userData.timezone}>
                            <SelectTrigger className="border-gray-300 bg-white pl-10 text-gray-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                              <SelectItem value="Australia/Melbourne">Melbourne (AEDT)</SelectItem>
                              <SelectItem value="Australia/Brisbane">Brisbane (AEST)</SelectItem>
                              <SelectItem value="Australia/Perth">Perth (AWST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="rounded-xl bg-gray-900 text-white hover:bg-gray-800">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Connections */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Connected Accounts</CardTitle>
                    <CardDescription className="text-gray-600">Manage your login methods and connected services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2">
                          <Mail className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">{userData.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">Primary</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">Google</p>
                          <p className="text-sm text-gray-600">Connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg border-gray-300 text-gray-900 hover:bg-gray-50">
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Security</CardTitle>
                    <CardDescription className="text-gray-600">Manage your password and two-factor authentication</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-gray-900">Password</p>
                          <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg border-gray-300 text-gray-900 hover:bg-gray-50">
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Switch checked={userData.twoFactorEnabled} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <>
                {/* Buyer Profile */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Buyer Profile</CardTitle>
                    <CardDescription className="text-gray-600">Tell us about your property goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.35em] text-gray-500">Buyer Type</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-900 bg-gray-50 p-4 transition hover:bg-gray-100">
                          <TrendingUp className="h-6 w-6 text-gray-900" />
                          <span className="text-gray-900">Investor</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 bg-white p-4 transition hover:bg-gray-50">
                          <Home className="h-6 w-6 text-gray-400" />
                          <span className="text-gray-600">Owner-Occupier</span>
                        </button>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.35em] text-gray-500">Budget Range</Label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Budget</span>
                          <span className="text-gray-900">$800,000 - $1,200,000</span>
                        </div>
                        <Slider defaultValue={[800000, 1200000]} max={3000000} step={50000} className="py-4" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="minBudget" className="text-xs text-gray-500">Minimum</Label>
                            <Input
                              id="minBudget"
                              type="text"
                              defaultValue="$800,000"
                              className="border-gray-300 bg-white text-gray-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxBudget" className="text-xs text-gray-500">Maximum</Label>
                            <Input
                              id="maxBudget"
                              type="text"
                              defaultValue="$1,200,000"
                              className="border-gray-300 bg-white text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.35em] text-gray-500">Loan Details</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deposit" className="text-xs text-gray-500">Deposit %</Label>
                          <Input
                            id="deposit"
                            type="text"
                            defaultValue="20%"
                            className="border-gray-300 bg-white text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="repayment" className="text-xs text-gray-500">Monthly Repayment Capacity</Label>
                          <Input
                            id="repayment"
                            type="text"
                            defaultValue="$5,000"
                            className="border-gray-300 bg-white text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Target Areas */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Target Areas</CardTitle>
                    <CardDescription className="text-gray-600">Select suburbs and set search radius</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.35em] text-gray-500">Target Suburbs</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Bondi
                          <XCircle className="ml-2 h-3 w-3 cursor-pointer" />
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Surry Hills
                          <XCircle className="ml-2 h-3 w-3 cursor-pointer" />
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Newtown
                          <XCircle className="ml-2 h-3 w-3 cursor-pointer" />
                        </Badge>
                        <Button variant="outline" size="sm" className="h-7 rounded-full border-dashed border-gray-300 text-gray-600">
                          <Plus className="mr-1 h-3 w-3" />
                          Add Suburb
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="radius" className="text-xs uppercase tracking-[0.35em] text-gray-500">Search Radius</Label>
                      <Select defaultValue="5km">
                        <SelectTrigger id="radius" className="border-gray-300 bg-white text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2km">Within 2km</SelectItem>
                          <SelectItem value="5km">Within 5km</SelectItem>
                          <SelectItem value="10km">Within 10km</SelectItem>
                          <SelectItem value="20km">Within 20km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commute" className="text-xs uppercase tracking-[0.35em] text-gray-500">Commute Location (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="commute"
                          placeholder="e.g., Sydney CBD"
                          className="border-gray-300 bg-white pl-10 text-gray-900"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Property Requirements */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Property Requirements</CardTitle>
                    <CardDescription className="text-gray-600">Define your ideal property features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="propertyType" className="text-xs uppercase tracking-[0.35em] text-gray-500">Property Type</Label>
                        <Select defaultValue="any">
                          <SelectTrigger id="propertyType" className="border-gray-300 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms" className="text-xs uppercase tracking-[0.35em] text-gray-500">Bedrooms</Label>
                        <Select defaultValue="2+">
                          <SelectTrigger id="bedrooms" className="border-gray-300 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="1+">1+</SelectItem>
                            <SelectItem value="2+">2+</SelectItem>
                            <SelectItem value="3+">3+</SelectItem>
                            <SelectItem value="4+">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms" className="text-xs uppercase tracking-[0.35em] text-gray-500">Bathrooms</Label>
                        <Select defaultValue="1+">
                          <SelectTrigger id="bathrooms" className="border-gray-300 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="1+">1+</SelectItem>
                            <SelectItem value="2+">2+</SelectItem>
                            <SelectItem value="3+">3+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parking" className="text-xs uppercase tracking-[0.35em] text-gray-500">Parking</Label>
                        <Select defaultValue="1+">
                          <SelectTrigger id="parking" className="border-gray-300 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="1+">1+</SelectItem>
                            <SelectItem value="2+">2+</SelectItem>
                            <SelectItem value="3+">3+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.35em] text-gray-500">Property Condition</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">New/Off-the-plan</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Existing properties</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Renovation required OK</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.35em] text-gray-500">Priority Features</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="cursor-pointer bg-gray-900 text-white hover:bg-gray-800">School Zone</Badge>
                        <Badge className="cursor-pointer bg-gray-900 text-white hover:bg-gray-800">Low Noise</Badge>
                        <Badge className="cursor-pointer border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">Public Transport</Badge>
                        <Badge className="cursor-pointer bg-gray-900 text-white hover:bg-gray-800">Capital Growth</Badge>
                        <Badge className="cursor-pointer border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">Rental Yield</Badge>
                        <Badge className="cursor-pointer border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">Near Beach</Badge>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.35em] text-gray-500">Risk Tolerance</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <button className="rounded-xl border-2 border-gray-200 bg-white p-3 text-center transition hover:border-gray-300 hover:bg-gray-50">
                          <p className="text-gray-900">Conservative</p>
                          <p className="text-xs text-gray-600">Low risk</p>
                        </button>
                        <button className="rounded-xl border-2 border-gray-900 bg-gray-50 p-3 text-center transition hover:bg-gray-100">
                          <p className="text-gray-900">Balanced</p>
                          <p className="text-xs text-gray-600">Moderate risk</p>
                        </button>
                        <button className="rounded-xl border-2 border-gray-200 bg-white p-3 text-center transition hover:border-gray-300 hover:bg-gray-50">
                          <p className="text-gray-900">Aggressive</p>
                          <p className="text-xs text-gray-600">Higher risk</p>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="rounded-xl bg-gray-900 text-white hover:bg-gray-800">
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Saved & Alerts Tab */}
            {activeTab === 'saved' && (
              <>
                {/* Saved Searches */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Saved Searches</CardTitle>
                    <CardDescription className="text-gray-600">Quick access to your frequently used searches</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'Bondi Apartments 2BR', filters: '2 bed, $800k-1M, Bondi', lastRun: '2 hours ago', count: 12 },
                      { name: 'Inner West Investment', filters: '3 bed, $1M-1.5M, Newtown area', lastRun: '1 day ago', count: 8 },
                      { name: 'Northern Beaches Houses', filters: '4 bed, $1.5M-2M, Manly-Dee Why', lastRun: '3 days ago', count: 15 },
                    ].map((search, index) => (
                      <div key={index} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                        <div className="flex items-start gap-3">
                          <Search className="mt-1 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-900">{search.name}</p>
                            <p className="text-sm text-gray-600">{search.filters}</p>
                            <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {search.lastRun}
                              </span>
                              <span>{search.count} new listings</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg border-gray-300 text-gray-900 hover:bg-gray-50">
                            Run Search
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full rounded-xl border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Search
                    </Button>
                  </CardContent>
                </Card>

                {/* Alert Settings */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Alert Settings</CardTitle>
                    <CardDescription className="text-gray-600">Choose how you want to be notified about new listings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-600">Receive alerts via email</p>
                          </div>
                        </div>
                        <Select defaultValue="daily">
                          <SelectTrigger className="w-32 border-gray-300 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="off">Off</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-gray-900">SMS Alerts</p>
                            <p className="text-sm text-gray-600">Get text messages for urgent updates</p>
                          </div>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-gray-900">In-App Notifications</p>
                            <p className="text-sm text-gray-600">Push notifications in browser</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Saved Properties */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Saved Properties</CardTitle>
                    <CardDescription className="text-gray-600">Properties you've favorited or shortlisted</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { address: '12/45 Campbell Parade, Bondi Beach', price: '$950,000', beds: 2, baths: 1, rating: 4, note: 'Great ocean views' },
                      { address: '78 Smith Street, Summer Hill', price: '$1,250,000', beds: 3, baths: 2, rating: 5, note: 'Perfect for family' },
                      { address: '5/120 Ramsgate Avenue, Bondi Beach', price: '$875,000', beds: 2, baths: 1, rating: 3, note: 'Needs renovation' },
                    ].map((property, index) => (
                      <div key={index} className="flex items-start justify-between rounded-xl border border-gray-200 p-4">
                        <div className="flex gap-4">
                          <div className="h-20 w-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200" />
                          <div>
                            <p className="text-gray-900">{property.address}</p>
                            <p className="mt-1 text-gray-600">{property.price}</p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                              <span>{property.beds} bed</span>
                              <span>{property.baths} bath</span>
                              <span className="flex items-center gap-1">
                                {'★'.repeat(property.rating)}{'☆'.repeat(5-property.rating)}
                              </span>
                            </div>
                            {property.note && (
                              <p className="mt-2 text-xs text-gray-600 italic">"{property.note}"</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Recently Viewed</CardTitle>
                    <CardDescription className="text-gray-600">Your browsing history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        '23 Ocean Street, Bondi - 2 hours ago',
                        '156 Campbell Parade, Bondi Beach - 5 hours ago',
                        '9/12 Hall Street, Bondi Beach - Yesterday',
                        '45 Gould Street, Bondi Beach - 2 days ago',
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
                          <span className="text-gray-600">{item}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Finance Tab */}
            {activeTab === 'finance' && (
              <>
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Finance Overview</CardTitle>
                    <CardDescription className="text-gray-600">Manage your budget and loan pre-approval status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Budget Calculator */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-gray-900">Affordability Calculator</h3>
                        <DollarSign className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Max Purchase Price</p>
                            <p className="text-2xl text-gray-900">$1,200,000</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Monthly Repayment</p>
                            <p className="text-2xl text-gray-900">$5,245</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl border-gray-300 bg-white text-gray-900 hover:bg-gray-50">
                          Recalculate Budget
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Pre-approval Status */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-gray-900">Loan Pre-Approval</h3>
                          <p className="text-sm text-gray-600">Get pre-approved to strengthen your offers</p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700">
                          <Clock className="mr-1 h-3 w-3" />
                          In Progress
                        </Badge>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Deposit Available</Label>
                            <p className="mt-1 text-gray-900">$240,000</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Annual Income</Label>
                            <p className="mt-1 text-gray-900">$120,000</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Existing Debts</Label>
                            <p className="mt-1 text-gray-900">$15,000</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Loan Term</Label>
                            <p className="mt-1 text-gray-900">30 years</p>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Connect with Loan Advisor
                      </Button>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Disclaimer */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-xs text-gray-600">
                        <strong>Note:</strong> All financial information is stored securely and used only for calculation purposes. 
                        We do not collect sensitive documents or share your data with third parties without consent.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <>
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Inspection History</CardTitle>
                    <CardDescription className="text-gray-600">Track your property viewings and evaluations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { address: '12/45 Campbell Parade, Bondi Beach', date: 'Sat, 16 Nov 2024, 2:00 PM', status: 'Completed', rating: 4, notes: 'Great layout, but small kitchen' },
                      { address: '78 Smith Street, Summer Hill', date: 'Sat, 9 Nov 2024, 11:00 AM', status: 'Completed', rating: 5, notes: 'Perfect! Ready to make an offer' },
                      { address: '5/120 Ramsgate Avenue, Bondi Beach', date: 'Sat, 23 Nov 2024, 10:00 AM', status: 'Scheduled', rating: 0, notes: '' },
                    ].map((inspection, index) => (
                      <div key={index} className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900">{inspection.address}</p>
                              {inspection.status === 'Completed' ? (
                                <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {inspection.date}
                            </div>
                            {inspection.status === 'Completed' && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <span className="text-gray-600">Rating:</span>
                                  <span className="text-amber-500">{'★'.repeat(inspection.rating)}{'☆'.repeat(5-inspection.rating)}</span>
                                </div>
                                {inspection.notes && (
                                  <p className="text-sm text-gray-600 italic">"{inspection.notes}"</p>
                                )}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Offers & Negotiations</CardTitle>
                    <CardDescription className="text-gray-600">Track your bids and negotiation progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { address: '78 Smith Street, Summer Hill', offer: '$1,180,000', status: 'Counter-offer', response: '$1,220,000', date: '2 days ago' },
                      { address: '12/45 Campbell Parade, Bondi Beach', offer: '$920,000', status: 'Rejected', response: null, date: '1 week ago' },
                    ].map((offer, index) => (
                      <div key={index} className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900">{offer.address}</p>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Your Offer</p>
                                <p className="text-gray-900">{offer.offer}</p>
                              </div>
                              {offer.response && (
                                <div>
                                  <p className="text-xs text-gray-500">Counter-offer</p>
                                  <p className="text-gray-900">{offer.response}</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              {offer.status === 'Counter-offer' ? (
                                <Badge className="bg-amber-100 text-amber-700">Counter-offer</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                              )}
                              <span className="text-xs text-gray-500">{offer.date}</span>
                            </div>
                          </div>
                          {offer.status === 'Counter-offer' && (
                            <Button size="sm" className="rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <>
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Notification Preferences</CardTitle>
                    <CardDescription className="text-gray-600">Choose what updates you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Marketing emails</p>
                          <p className="text-sm text-gray-600">Property tips, market updates, and promotions</p>
                        </div>
                        <Switch />
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">System notifications</p>
                          <p className="text-sm text-gray-600">Account activity and security alerts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Property recommendations</p>
                          <p className="text-sm text-gray-600">AI-powered suggestions based on your preferences</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">New listing alerts</p>
                          <p className="text-sm text-gray-600">Get notified when properties match your saved searches</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Privacy & Data</CardTitle>
                    <CardDescription className="text-gray-600">Manage your data and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Share search data for better recommendations</p>
                          <p className="text-sm text-gray-600">Help us improve property suggestions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Allow map service tracking</p>
                          <p className="text-sm text-gray-600">Google Maps for location-based features</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Third-party valuation data</p>
                          <p className="text-sm text-gray-600">CoreLogic, Domain, and other property data providers</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription className="text-gray-600">Irreversible actions - proceed with caution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-red-50 p-4">
                      <h4 className="mb-2 text-gray-900">Delete Account</h4>
                      <p className="mb-4 text-sm text-gray-600">
                        Once you delete your account, all your data including saved searches, favorites, and preferences will be permanently removed. 
                        This action cannot be undone.
                      </p>
                      <Button variant="destructive" className="rounded-xl bg-red-600 text-white hover:bg-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete My Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <>
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Current Plan</CardTitle>
                    <CardDescription className="text-gray-600">Manage your subscription and billing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-gray-900">Free Plan</h3>
                          <p className="text-sm text-gray-600">Basic property search features</p>
                        </div>
                        <Badge className="bg-gray-900 text-white">Current</Badge>
                      </div>
                      <ul className="mb-4 space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Up to 3 saved searches
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          10 property favorites
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Basic property insights
                        </li>
                      </ul>
                      <Button className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800">
                        Upgrade to Premium
                      </Button>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Premium Plan Preview */}
                    <div className="rounded-xl border-2 border-gray-900 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-gray-900">Premium Plan</h3>
                          <p className="text-sm text-gray-600">Advanced features for serious buyers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-gray-900">$29</p>
                          <p className="text-sm text-gray-600">/month</p>
                        </div>
                      </div>
                      <ul className="mb-4 space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Unlimited saved searches
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Unlimited favorites
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Advanced property analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Priority email support
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Instant new listing alerts
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Market trend reports
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full rounded-xl border-gray-300 text-gray-900 hover:bg-gray-50">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Payment Method</CardTitle>
                    <CardDescription className="text-gray-600">Manage your payment information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                      <div>
                        <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p className="mb-1 text-gray-900">No payment method added</p>
                        <p className="mb-4 text-sm text-gray-600">Add a payment method to upgrade to Premium</p>
                        <Button variant="outline" className="rounded-xl border-gray-300 text-gray-900 hover:bg-gray-50">
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Billing History</CardTitle>
                    <CardDescription className="text-gray-600">View and download past invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center rounded-xl border border-gray-200 p-8 text-center">
                      <div>
                        <p className="text-gray-600">No billing history available</p>
                        <p className="mt-1 text-sm text-gray-500">Your invoices will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
