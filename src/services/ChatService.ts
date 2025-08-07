import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot, 
  doc, 
  updateDoc,
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { SecurityIncident, SecurityMessage } from '../types';

export interface CreateIncidentRequest {
  title: string;
  description: string;
  type: SecurityIncident['type'];
  priority: SecurityIncident['priority'];
  residentId: string;
  residentName: string;
  unitNumber: string;
  estateId: string;
  location?: string;
}

export default class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Get all incidents for a specific user
  async getUserIncidents(userId: string, estateId: string): Promise<SecurityIncident[]> {
    try {
      const incidentsQuery = query(
        collection(db, 'securityIncidents'),
        where('residentId', '==', userId),
        where('estateId', '==', estateId),
        orderBy('updatedAt', 'desc')
      );

      const incidentsSnapshot = await getDocs(incidentsQuery);
      const incidents: SecurityIncident[] = [];

      for (const incidentDoc of incidentsSnapshot.docs) {
        const incidentData = incidentDoc.data();
        
        // Get last message for each incident
        const lastMessageQuery = query(
          collection(db, 'securityMessages'),
          where('incidentId', '==', incidentDoc.id),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        const lastMessageSnapshot = await getDocs(lastMessageQuery);
        let lastMessage: SecurityMessage | undefined;

        if (!lastMessageSnapshot.empty) {
          const lastMessageDoc = lastMessageSnapshot.docs[0];
          const lastMessageData = lastMessageDoc.data();
          lastMessage = {
            id: lastMessageDoc.id,
            incidentId: lastMessageData.incidentId,
            senderId: lastMessageData.senderId,
            senderName: lastMessageData.senderName,
            senderRole: lastMessageData.senderRole,
            message: lastMessageData.message,
            timestamp: lastMessageData.timestamp?.toDate() || new Date(),
            type: lastMessageData.type || 'message',
            attachments: lastMessageData.attachments || [],
          };
        }

        incidents.push({
          id: incidentDoc.id,
          title: incidentData.title,
          description: incidentData.description,
          type: incidentData.type,
          priority: incidentData.priority,
          status: incidentData.status,
          createdAt: incidentData.createdAt?.toDate() || new Date(),
          updatedAt: incidentData.updatedAt?.toDate() || new Date(),
          residentId: incidentData.residentId,
          residentName: incidentData.residentName,
          unitNumber: incidentData.unitNumber,
          estateId: incidentData.estateId,
          assignedOfficer: incidentData.assignedOfficer,
          estimatedResolution: incidentData.estimatedResolution?.toDate(),
          location: incidentData.location,
          lastMessage,
        });
      }

      return incidents;
    } catch (error) {
      console.error('Error fetching user incidents:', error);
      // Return mock data for development
      return this.getMockIncidents(userId, estateId);
    }
  }

  // Create a new security incident
  async createIncident(request: CreateIncidentRequest): Promise<string> {
    try {
      const incidentData = {
        title: request.title,
        description: request.description,
        type: request.type,
        priority: request.priority,
        status: 'open',
        residentId: request.residentId,
        residentName: request.residentName,
        unitNumber: request.unitNumber,
        estateId: request.estateId,
        location: request.location,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const incidentRef = await addDoc(collection(db, 'securityIncidents'), incidentData);

      // Send initial system message
      await this.sendSystemMessage(
        incidentRef.id,
        `New ${request.type.replace('_', ' ')} reported by ${request.residentName} from unit ${request.unitNumber}. Priority: ${request.priority}. Security team has been notified and will respond shortly.`,
        'system_notification'
      );

      return incidentRef.id;
    } catch (error) {
      console.error('Error creating incident:', error);
      // Return mock ID for development
      return 'mock-incident-' + Date.now();
    }
  }

  // Get messages for a specific incident
  async getIncidentMessages(incidentId: string): Promise<SecurityMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, 'securityMessages'),
        where('incidentId', '==', incidentId),
        orderBy('timestamp', 'asc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages: SecurityMessage[] = [];

      messagesSnapshot.forEach((messageDoc) => {
        const messageData = messageDoc.data();
        messages.push({
          id: messageDoc.id,
          incidentId: messageData.incidentId,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          senderRole: messageData.senderRole,
          message: messageData.message,
          timestamp: messageData.timestamp?.toDate() || new Date(),
          type: messageData.type || 'message',
          attachments: messageData.attachments || [],
        });
      });

      return messages;
    } catch (error) {
      console.error('Error fetching incident messages:', error);
      // Return mock messages for development
      return this.getMockMessages(incidentId);
    }
  }

  // Subscribe to real-time message updates for an incident
  subscribeToIncidentMessages(incidentId: string, callback: (messages: SecurityMessage[]) => void): () => void {
    try {
      const messagesQuery = query(
        collection(db, 'securityMessages'),
        where('incidentId', '==', incidentId),
        orderBy('timestamp', 'asc')
      );

      return onSnapshot(messagesQuery, (snapshot) => {
        const messages: SecurityMessage[] = [];
        snapshot.forEach((messageDoc) => {
          const messageData = messageDoc.data();
          messages.push({
            id: messageDoc.id,
            incidentId: messageData.incidentId,
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            senderRole: messageData.senderRole,
            message: messageData.message,
            timestamp: messageData.timestamp?.toDate() || new Date(),
            type: messageData.type || 'message',
            attachments: messageData.attachments || [],
          });
        });
        callback(messages);
      });
    } catch (error) {
      console.error('Error subscribing to incident messages:', error);
      // Return mock unsubscribe function
      return () => {};
    }
  }

  // Send a message to an incident
  async sendMessage(
    incidentId: string,
    senderId: string,
    senderName: string,
    senderRole: 'resident' | 'security' | 'management',
    message: string,
    type: 'message' | 'status_update' | 'system_notification' = 'message',
    attachments?: string[]
  ): Promise<string> {
    try {
      const messageData = {
        incidentId,
        senderId,
        senderName,
        senderRole,
        message,
        type,
        timestamp: serverTimestamp(),
        attachments: attachments || [],
      };

      const messageRef = await addDoc(collection(db, 'securityMessages'), messageData);

      // Update the incident's last message and updated timestamp
      const incidentRef = doc(db, 'securityIncidents', incidentId);
      await updateDoc(incidentRef, {
        updatedAt: serverTimestamp(),
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      // Return mock ID for development
      return 'mock-message-' + Date.now();
    }
  }

  // Send system notification
  async sendSystemMessage(
    incidentId: string,
    message: string,
    type: 'status_update' | 'system_notification' = 'system_notification'
  ): Promise<string> {
    return this.sendMessage(
      incidentId,
      'system',
      'Security System',
      'security',
      message,
      type
    );
  }

  // Update incident status
  async updateIncidentStatus(
    incidentId: string,
    status: SecurityIncident['status'],
    assignedOfficer?: string,
    estimatedResolution?: Date
  ): Promise<void> {
    try {
      const incidentRef = doc(db, 'securityIncidents', incidentId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (assignedOfficer) {
        updateData.assignedOfficer = assignedOfficer;
      }

      if (estimatedResolution) {
        updateData.estimatedResolution = estimatedResolution;
      }

      await updateDoc(incidentRef, updateData);

      // Send status update message
      let statusMessage = `Incident status updated to: ${status.replace('_', ' ')}`;
      if (assignedOfficer) {
        statusMessage += `. Assigned to: ${assignedOfficer}`;
      }
      if (estimatedResolution) {
        statusMessage += `. Estimated resolution: ${estimatedResolution.toLocaleDateString()}`;
      }

      await this.sendSystemMessage(incidentId, statusMessage, 'status_update');
    } catch (error) {
      console.error('Error updating incident status:', error);
    }
  }

  // Mock data for development/testing
  private getMockIncidents(userId: string, estateId: string): SecurityIncident[] {
    return [
      {
        id: 'incident-1',
        title: 'Security Alert - Suspicious Activity',
        description: 'Noticed someone loitering near the main gate for extended periods.',
        type: 'security_alert',
        priority: 'high',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        updatedAt: new Date(Date.now() - 1800000), // 30 minutes ago
        residentId: userId,
        residentName: 'John Doe',
        unitNumber: 'A-101',
        estateId,
        assignedOfficer: 'Officer Smith',
        estimatedResolution: new Date(Date.now() + 7200000), // 2 hours from now
        location: 'Main Gate Area',
        lastMessage: {
          id: 'msg-1',
          incidentId: 'incident-1',
          senderId: 'security-001',
          senderName: 'Officer Smith',
          senderRole: 'security',
          message: 'Thank you for the report. I\'ve increased patrols in that area and will monitor the situation closely.',
          timestamp: new Date(Date.now() - 1800000),
          type: 'message',
        },
      },
      {
        id: 'incident-2',
        title: 'Maintenance Request - Gate Malfunction',
        description: 'The main gate seems to be closing very slowly and making unusual noises.',
        type: 'maintenance_request',
        priority: 'medium',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 43200000), // 12 hours ago
        residentId: userId,
        residentName: 'John Doe',
        unitNumber: 'A-101',
        estateId,
        assignedOfficer: 'Maintenance Team',
        location: 'Main Gate',
        lastMessage: {
          id: 'msg-2',
          incidentId: 'incident-2',
          senderId: 'system',
          senderName: 'Security System',
          senderRole: 'security',
          message: 'Maintenance team has been notified. A technician will inspect the gate motor system tomorrow morning.',
          timestamp: new Date(Date.now() - 43200000),
          type: 'status_update',
        },
      },
    ];
  }

  private getMockMessages(incidentId: string): SecurityMessage[] {
    return [
      {
        id: 'msg-1',
        incidentId,
        senderId: 'system',
        senderName: 'Security System',
        senderRole: 'security',
        message: 'Your report has been received and logged. A security officer will review it shortly.',
        timestamp: new Date(Date.now() - 3600000),
        type: 'system_notification',
      },
      {
        id: 'msg-2',
        incidentId,
        senderId: 'security-001',
        senderName: 'Officer Smith',
        senderRole: 'security',
        message: 'Thank you for bringing this to our attention. I\'m currently investigating the matter.',
        timestamp: new Date(Date.now() - 1800000),
        type: 'message',
      },
      {
        id: 'msg-3',
        incidentId,
        senderId: 'resident-001',
        senderName: 'John Doe',
        senderRole: 'resident',
        message: 'Thank you for the quick response. Please keep me updated on any developments.',
        timestamp: new Date(Date.now() - 900000),
        type: 'message',
      },
    ];
  }
}