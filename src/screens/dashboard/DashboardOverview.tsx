'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface DashboardOverviewProps {
  user: { email: string; role: string }
}

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const stats = [
    { 
      title: 'Active Residents', 
      value: '247', 
      change: '+12%', 
      icon: '👥', 
      color: 'from-blue-500 to-cyan-600',
      progress: 85 
    },
    { 
      title: 'Security Alerts', 
      value: '3', 
      change: '-25%', 
      icon: '🚨', 
      color: 'from-red-500 to-pink-600',
      progress: 15 
    },
    { 
      title: 'Maintenance Requests', 
      value: '18', 
      change: '+8%', 
      icon: '🔧', 
      color: 'from-yellow-500 to-orange-600',
      progress: 65 
    },
    { 
      title: 'System Health', 
      value: '99.8%', 
      change: '+0.2%', 
      icon: '💚', 
      color: 'from-green-500 to-emerald-600',
      progress: 98 
    },
  ]

  const recentActivity = [
    { 
      id: 1, 
      type: 'security', 
      message: 'Unauthorized access attempt at Gate A', 
      time: '2 minutes ago', 
      priority: 'high',
      icon: '🛡️' 
    },
    { 
      id: 2, 
      type: 'maintenance', 
      message: 'Elevator maintenance completed in Block C', 
      time: '15 minutes ago', 
      priority: 'medium',
      icon: '🔧' 
    },
    { 
      id: 3, 
      type: 'resident', 
      message: 'New resident registration: Unit 420', 
      time: '32 minutes ago', 
      priority: 'low',
      icon: '🏠' 
    },
    { 
      id: 4, 
      type: 'system', 
      message: 'Backup systems tested successfully', 
      time: '1 hour ago', 
      priority: 'low',
      icon: '⚙️' 
    },
  ]

  const quickActions = [
    { title: 'Emergency Broadcast', icon: '📢', color: 'from-red-500 to-pink-600' },
    { title: 'Gate Control', icon: '🚪', color: 'from-blue-500 to-cyan-600' },
    { title: 'Camera Feed', icon: '📹', color: 'from-purple-500 to-indigo-600' },
    { title: 'Visitor Management', icon: '👋', color: 'from-green-500 to-emerald-600' },
  ]

  const systemStatus = [
    { name: 'CCTV Network', status: 'online', uptime: '99.9%' },
    { name: 'Access Control', status: 'online', uptime: '99.8%' },
    { name: 'Fire Safety', status: 'online', uptime: '100%' },
    { name: 'Communication', status: 'maintenance', uptime: '95.2%' },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl bg-white/5 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.role === 'admin' ? 'Administrator' : 'Security Officer'}! 👋
            </h1>
            <p className="text-white/70 text-lg">
              Here&apos;s what&apos;s happening at Seren Residential today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm">Current Time</p>
            <p className="text-white font-mono text-lg">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                stat.change.startsWith('+') ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-white/70 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-white text-2xl font-bold mb-3">{stat.value}</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6 rounded-2xl bg-white/5 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2">📋</span>
              Recent Activity
            </h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="text-2xl mr-4">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message}</p>
                  <p className="text-white/60 text-sm">{activity.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                  {activity.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-2xl bg-white/5 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 text-center group"
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <p className="text-white text-sm font-medium">{action.title}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6 rounded-2xl bg-white/5 border border-white/20"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">🖥️</span>
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStatus.map((system, index) => (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium text-sm">{system.name}</p>
                <div className={`w-3 h-3 rounded-full ${
                  system.status === 'online' ? 'bg-green-500 animate-pulse' : 
                  system.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <p className={`text-xs font-medium ${
                system.status === 'online' ? 'text-green-400' : 
                system.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {system.status.toUpperCase()}
              </p>
              <p className="text-white/60 text-xs mt-1">Uptime: {system.uptime}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        .glass-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  )
} 