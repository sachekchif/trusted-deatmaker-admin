'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, TabletSmartphone, Bell, CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const shortCodes = [
	{ code: '{{fullname}}', description: 'Full Name of User' },
	{ code: '{{username}}', description: 'Username of User' },
	{ code: '{{message}}', description: 'Message' },
	{ code: '{{site_name}}', description: 'Name of your site' },
];

export default function NotificationSettingsPage() {
	const [globalTab, setGlobalTab] = useState<'email' | 'sms' | 'push'>('email');

	return (
		<div className="container p-4 md:p-6 space-y-6">
			{/* Top Main Tabs */}
			<Tabs
				defaultValue="global"
				className="w-full">
				<div className="w-full bg-[#f2f9fd] rounded-t-lg overflow-x-auto">
					<TabsList className="bg-transparent h-14 justify-start p-0 rounded-none w-max border-b">
						<TabsTrigger
							value="global"
							className="h-full px-6 rounded-none data-[state=active]:bg-white data-[state=active]:text-[#0092ca] data-[state=active]:border-t-2 data-[state=active]:border-t-[#0092ca] hover:bg-white/50 data-[state=active]:shadow-none font-medium text-gray-600 transition-colors">
							Global Template
						</TabsTrigger>
						<TabsTrigger
							value="email-setting"
							className="h-full px-6 rounded-none data-[state=active]:bg-white data-[state=active]:text-[#0092ca] data-[state=active]:border-t-2 data-[state=active]:border-t-[#0092ca] hover:bg-white/50 data-[state=active]:shadow-none font-medium text-gray-600 transition-colors">
							Email Setting
						</TabsTrigger>
						<TabsTrigger
							value="sms-setting"
							className="h-full px-6 rounded-none data-[state=active]:bg-white data-[state=active]:text-[#0092ca] data-[state=active]:border-t-2 data-[state=active]:border-t-[#0092ca] hover:bg-white/50 data-[state=active]:shadow-none font-medium text-gray-600 transition-colors">
							SMS Setting
						</TabsTrigger>
						<TabsTrigger
							value="push-setting"
							className="h-full px-6 rounded-none data-[state=active]:bg-white data-[state=active]:text-[#0092ca] data-[state=active]:border-t-2 data-[state=active]:border-t-[#0092ca] hover:bg-white/50 data-[state=active]:shadow-none font-medium text-gray-600 transition-colors">
							Push Notification Setting
						</TabsTrigger>
						<TabsTrigger
							value="templates"
							className="h-full px-6 rounded-none data-[state=active]:bg-white data-[state=active]:text-[#0092ca] data-[state=active]:border-t-2 data-[state=active]:border-t-[#0092ca] hover:bg-white/50 data-[state=active]:shadow-none font-medium text-gray-600 transition-colors">
							Notification Templates
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="bg-white border rounded-b-lg p-6 md:p-8 min-h-[600px]">
					{/* GLOBAL TEMPLATE CONTENT */}
					<TabsContent
						value="global"
						className="mt-0 outline-none">
						<h2 className="text-xl font-semibold mb-6">
							Global Email Template
						</h2>

						<div className="flex flex-wrap gap-4 mb-8">
							<button
								onClick={() => setGlobalTab('email')}
								className={`flex flex-col items-center justify-center w-40 h-24 rounded-lg border-2 transition-all shadow-sm ${
									globalTab === 'email'
										? 'border-[#0092ca] text-[#0092ca]'
										: 'border-gray-200 text-gray-400 hover:border-gray-300'
								}`}>
								<Mail
									className="w-6 h-6 mb-2"
									strokeWidth={1.5}
								/>
								<span className="font-medium text-[15px]">Email Template</span>
							</button>

							<button
								onClick={() => setGlobalTab('sms')}
								className={`flex flex-col items-center justify-center w-40 h-24 rounded-lg border-2 transition-all shadow-sm ${
									globalTab === 'sms'
										? 'border-[#0092ca] text-[#0092ca]'
										: 'border-gray-200 text-gray-400 hover:border-gray-300'
								}`}>
								<TabletSmartphone
									className="w-6 h-6 mb-2"
									strokeWidth={1.5}
								/>
								<span className="font-medium text-[15px]">SMS Template</span>
							</button>

							<button
								onClick={() => setGlobalTab('push')}
								className={`flex flex-col items-center justify-center w-52 h-24 rounded-lg border-2 transition-all shadow-sm ${
									globalTab === 'push'
										? 'border-[#0092ca] text-[#0092ca]'
										: 'border-gray-200 text-gray-400 hover:border-gray-300'
								}`}>
								<Bell
									className="w-6 h-6 mb-2"
									strokeWidth={1.5}
								/>
								<span className="font-medium text-[15px]">
									Push Notification Template
								</span>
							</button>
						</div>

						{/* Shortcodes Table (Common for all three sub-tabs) */}
						<div className="mb-8">
							<div className="flex border-b border-gray-300 pb-2 mb-4 px-2">
								<div className="flex flex-1 items-center gap-2">
									<Checkbox
										checked
										disabled
										className="opacity-50"
									/>
									<span className="text-sm font-semibold">Short code</span>
								</div>
								<div className="text-sm font-semibold flex-1 text-right">
									Description
								</div>
							</div>

							<div className="space-y-4">
								{shortCodes.map((item, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 px-2 group">
										<div className="flex items-center gap-2">
											<Checkbox
												disabled
												checked
												className="opacity-30 border-blue-200 data-[state=checked]:bg-blue-100 data-[state=checked]:text-[#0092ca]"
											/>
											<span className="text-[14px] text-[#0092ca] font-medium mx-2 bg-[#f2f9fd] px-2 py-1 rounded">
												{item.code}
											</span>
										</div>
										<div className="text-[14px] font-semibold text-gray-800">
											{item.description}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Form Fields based on sub-tab */}
						{globalTab === 'email' && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="space-y-6">
									<div>
										<label className="block text-[15px] font-semibold mb-2">
											Email Sent From (Name)
										</label>
										<Input
											placeholder="Name sending mail"
											className="h-11 shadow-sm border-gray-200"
										/>
									</div>
									<div>
										<label className="block text-[15px] font-semibold mb-2">
											Email Sent From (Email)
										</label>
										<Input
											placeholder="Email sending mail"
											className="h-11 shadow-sm border-gray-200"
										/>
									</div>
								</div>
								<div>
									<label className="block text-[15px] font-semibold mb-2">
										Email Body Description
									</label>
									<Textarea
										placeholder="Input your message"
										className="h-[140px] resize-none shadow-sm border-gray-200"
									/>
								</div>
							</div>
						)}

						{globalTab === 'sms' && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<label className="block text-[15px] font-semibold mb-2">
										SMS Sent From (Name)
									</label>
									<Input
										placeholder="Name sending mail"
										className="h-11 shadow-sm border-gray-200"
									/>
								</div>
								<div>
									<label className="block text-[15px] font-semibold mb-2">
										SMS Body
									</label>
									<Textarea
										placeholder="Input your message"
										className="h-[140px] resize-none shadow-sm border-gray-200"
									/>
								</div>
							</div>
						)}

						{globalTab === 'push' && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<label className="block text-[15px] font-semibold mb-2">
										Notification Title
									</label>
									<Input
										placeholder="{{site_name}}"
										defaultValue="{{site_name}}"
										className="h-11 shadow-sm border-gray-200"
									/>
								</div>
								<div>
									<label className="block text-[15px] font-semibold mb-2">
										Push Notification Body
									</label>
									<Textarea
										placeholder="hi {{fullname}} {{username}}, {{message}}"
										defaultValue="hi {{fullname}} {{username}}, {{message}}"
										className="h-[140px] resize-none shadow-sm border-gray-200"
									/>
								</div>
							</div>
						)}

						<div className="mt-10">
							<Button className="w-full bg-[#0092ca] hover:bg-[#007dae] text-white h-11 text-[15px]">
								Submit
							</Button>
						</div>
					</TabsContent>

					{/* EMAIL SETTING CONTENT */}
					<TabsContent
						value="email-setting"
						className="mt-0 outline-none">
						<h2 className="text-xl font-semibold mb-6">
							Email Notification Setting
						</h2>

						<div className="space-y-6 max-w-full">
							<div>
								<label className="block text-[15px] font-semibold mb-2">
									Email Send Method
								</label>
								<Input
									defaultValue="PHP Method"
									className="h-11 shadow-sm border-gray-200 max-w-full"
								/>
							</div>

							<Button className="w-full bg-[#0092ca] hover:bg-[#007dae] text-white h-11 text-[15px]">
								Submit
							</Button>
						</div>
					</TabsContent>

					{/* SMS SETTING CONTENT (Placeholder for now since no design) */}
					<TabsContent
						value="sms-setting"
						className="mt-0 outline-none">
						<div className="py-10 text-center text-gray-500">
							SMS Settings configuration goes here.
						</div>
					</TabsContent>

					{/* PUSH NOTIFICATION SETTING CONTENT */}
					<TabsContent
						value="push-setting"
						className="mt-0 outline-none">
						<div className="py-10 text-center text-gray-500">
							Push Notification Settings configuration goes here.
						</div>
					</TabsContent>

					{/* NOTIFICATION TEMPLATES CONTENT */}
					<TabsContent
						value="templates"
						className="mt-0 outline-none">
						<div className="py-10 text-center text-gray-500">
							Notification Templates List goes here.
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
