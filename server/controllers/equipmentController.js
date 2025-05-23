import { logger } from '../utils/logger.js';
import { executeQuery, executeStoredProcedure } from '../utils/dbConnector.js';
import { getSettings } from '../utils/settings.js';
import { sampleProjects } from '../data/sampleData.js';

// Get all equipment
export const getAllEquipment = async (req, res, next) => {
  try {
    const { demoMode } = getSettings();
    
    if (demoMode) {
      // Extract all equipment from sample projects
      const equipment = [];
      sampleProjects.forEach(project => {
        project.orders.forEach(order => {
          if (order.deliveryNotes) {
            order.deliveryNotes.forEach(note => {
              if (note.equipments) {
                note.equipments.forEach(equip => {
                  equipment.push({
                    ...equip,
                    projectId: project.id,
                    projectName: project.projectName,
                    orderId: order.id,
                    orderCode: order.code,
                    deliveryNoteCode: note.code
                  });
                });
              }
            });
          }
        });
      });
      
      return res.json(equipment);
    }
    
    const query = `
      SELECT 
        e.*,
        dn.Code as DeliveryNoteCode,
        o.Id as OrderId,
        o.Code as OrderCode,
        p.Id as ProjectId,
        p.ProjectName,
        p.ProjectCode
      FROM Equipments e
      JOIN DeliveryNotes dn ON e.DeliveryNoteId = dn.Id
      JOIN Orders o ON dn.OrderId = o.Id
      JOIN Projects p ON o.ProjectId = p.Id
      ORDER BY e.CreatedAt DESC
    `;
    
    const equipment = await executeQuery(query);
    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

// Get a specific equipment by ID
export const getEquipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { demoMode } = getSettings();
    
    if (demoMode) {
      // Find equipment in sample projects
      let foundEquipment = null;
      let projectInfo = null;
      let orderInfo = null;
      let deliveryNoteInfo = null;
      
      sampleProjects.forEach(project => {
        project.orders.forEach(order => {
          if (order.deliveryNotes) {
            order.deliveryNotes.forEach(note => {
              if (note.equipments) {
                const equipment = note.equipments.find(e => e.id === id);
                if (equipment) {
                  foundEquipment = { ...equipment };
                  projectInfo = {
                    id: project.id,
                    name: project.projectName,
                    code: project.projectCode
                  };
                  orderInfo = {
                    id: order.id,
                    code: order.code
                  };
                  deliveryNoteInfo = {
                    id: note.id,
                    code: note.code
                  };
                }
              }
            });
          }
        });
      });
      
      if (!foundEquipment) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      
      // Add context information
      foundEquipment.project = projectInfo;
      foundEquipment.order = orderInfo;
      foundEquipment.deliveryNote = deliveryNoteInfo;
      
      return res.json(foundEquipment);
    }
    
    const query = `
      SELECT 
        e.*,
        dn.Code as DeliveryNoteCode,
        o.Id as OrderId,
        o.Code as OrderCode,
        p.Id as ProjectId,
        p.ProjectName,
        p.ProjectCode
      FROM Equipments e
      JOIN DeliveryNotes dn ON e.DeliveryNoteId = dn.Id
      JOIN Orders o ON dn.OrderId = o.Id
      JOIN Projects p ON o.ProjectId = p.Id
      WHERE e.Id = @param0
    `;
    
    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    
    const equipment = results[0];
    
    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

// Get equipment by delivery note ID
export const getEquipmentByDeliveryNoteId = async (req, res, next) => {
  try {
    const { deliveryNoteId } = req.params;
    const { demoMode } = getSettings();
    
    if (demoMode) {
      // Find delivery note in sample projects
      let foundEquipments = [];
      
      sampleProjects.forEach(project => {
        project.orders.forEach(order => {
          if (order.deliveryNotes) {
            const note = order.deliveryNotes.find(n => n.id === deliveryNoteId);
            if (note && note.equipments) {
              foundEquipments = note.equipments;
            }
          }
        });
      });
      
      return res.json(foundEquipments);
    }
    
    const query = `
      SELECT *
      FROM Equipments
      WHERE DeliveryNoteId = @param0
    `;
    
    const equipment = await executeQuery(query, [deliveryNoteId]);
    
    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

// Create a new equipment
export const createEquipment = async (req, res, next) => {
  try {
    const { demoMode } = getSettings();
    const equipment = req.body;
    
    if (!equipment.deliveryNoteId) {
      return res.status(400).json({ 
        error: true, 
        message: 'Se requiere deliveryNoteId' 
      });
    }
    
    if (demoMode) {
      // Just return a success response with a fake ID in demo mode
      return res.status(201).json({ 
        id: `demo-${Date.now()}`, 
        ...equipment,
        isVerified: false,
        isMatched: false,
        matchedWithId: null,
        estimatedEquipmentId: null,
        createdAt: new Date().toISOString()
      });
    }
    
    const result = await executeStoredProcedure('sp_CreateEquipment', {
      DeliveryNoteId: equipment.deliveryNoteId,
      Name: equipment.name,
      SerialNumber: equipment.serialNumber,
      PartNumber: equipment.partNumber,
      DeviceName: equipment.deviceName,
      Type: equipment.type,
      Model: equipment.model,
      PhotoPath: equipment.photoPath
    });
    
    // Update DeliveryNote deliveredEquipment count
    const updateQuery = `
      UPDATE DeliveryNotes
      SET 
        DeliveredEquipment = (
          SELECT COUNT(*) 
          FROM Equipments 
          WHERE DeliveryNoteId = @param0
        ),
        UpdatedAt = GETDATE()
      WHERE Id = @param0
    `;
    
    await executeQuery(updateQuery, [equipment.deliveryNoteId]);
    
    res.status(201).json({
      id: result[0].Id,
      ...equipment,
      isVerified: false,
      isMatched: false,
      matchedWithId: null,
      estimatedEquipmentId: null,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Update equipment
export const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { demoMode } = getSettings();
    const updates = req.body;
    
    if (demoMode) {
      // Return success in demo mode
      return res.json({ id, ...updates });
    }
    
    const query = `
      UPDATE Equipments
      SET 
        Name = COALESCE(@param1, Name),
        SerialNumber = COALESCE(@param2, SerialNumber),
        PartNumber = COALESCE(@param3, PartNumber),
        DeviceName = COALESCE(@param4, DeviceName),
        Type = COALESCE(@param5, Type),
        Model = COALESCE(@param6, Model),
        IsVerified = COALESCE(@param7, IsVerified),
        PhotoPath = COALESCE(@param8, PhotoPath),
        IsMatched = COALESCE(@param9, IsMatched),
        MatchedWithId = COALESCE(@param10, MatchedWithId),
        EstimatedEquipmentId = COALESCE(@param11, EstimatedEquipmentId),
        UpdatedAt = GETDATE()
      WHERE Id = @param0
    `;
    
    await executeQuery(query, [
      id,
      updates.name,
      updates.serialNumber,
      updates.partNumber,
      updates.deviceName,
      updates.type,
      updates.model,
      updates.isVerified,
      updates.photoPath,
      updates.isMatched,
      updates.matchedWithId,
      updates.estimatedEquipmentId
    ]);
    
    // If verification status changed to true, update delivery note verified count
    if (updates.isVerified === true) {
      // First get the delivery note ID
      const getEquipQuery = `
        SELECT DeliveryNoteId 
        FROM Equipments 
        WHERE Id = @param0
      `;
      
      const equipResult = await executeQuery(getEquipQuery, [id]);
      
      if (equipResult.length > 0 && equipResult[0].DeliveryNoteId) {
        const deliveryNoteId = equipResult[0].DeliveryNoteId;
        
        // Update DeliveryNote verifiedEquipment count and progress
        const updateDNQuery = `
          UPDATE DeliveryNotes
          SET 
            VerifiedEquipment = (
              SELECT COUNT(*) 
              FROM Equipments 
              WHERE DeliveryNoteId = @param0 AND IsVerified = 1
            ),
            Progress = (
              SELECT CAST(COUNT(*) * 100.0 / NULLIF(EstimatedEquipment, 0) AS int)
              FROM Equipments 
              WHERE DeliveryNoteId = @param0 AND IsVerified = 1
            ),
            UpdatedAt = GETDATE()
          WHERE Id = @param0
        `;
        
        await executeQuery(updateDNQuery, [deliveryNoteId]);
        
        // Update Order progress
        const updateOrderQuery = `
          UPDATE Orders
          SET 
            Progress = (
              SELECT AVG(Progress)
              FROM DeliveryNotes
              WHERE OrderId = (
                SELECT OrderId 
                FROM DeliveryNotes 
                WHERE Id = @param0
              )
            ),
            UpdatedAt = GETDATE()
          WHERE Id = (
            SELECT OrderId 
            FROM DeliveryNotes 
            WHERE Id = @param0
          )
        `;
        
        await executeQuery(updateOrderQuery, [deliveryNoteId]);
        
        // Update Project progress
        const updateProjectQuery = `
          UPDATE Projects
          SET 
            Progress = (
              SELECT AVG(Progress)
              FROM Orders
              WHERE ProjectId = (
                SELECT p.Id 
                FROM Projects p
                JOIN Orders o ON o.ProjectId = p.Id
                JOIN DeliveryNotes dn ON dn.OrderId = o.Id
                WHERE dn.Id = @param0
              )
            ),
            UpdatedAt = GETDATE()
          WHERE Id = (
            SELECT p.Id 
            FROM Projects p
            JOIN Orders o ON o.ProjectId = p.Id
            JOIN DeliveryNotes dn ON dn.OrderId = o.Id
            WHERE dn.Id = @param0
          )
        `;
        
        await executeQuery(updateProjectQuery, [deliveryNoteId]);
      }
    }
    
    res.json({ id, ...updates });
  } catch (error) {
    next(error);
  }
};

// Delete equipment
export const deleteEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { demoMode } = getSettings();
    
    if (demoMode) {
      // Return success in demo mode
      return res.json({ message: 'Equipo eliminado correctamente' });
    }
    
    // First get the delivery note ID
    const getEquipQuery = `
      SELECT DeliveryNoteId 
      FROM Equipments 
      WHERE Id = @param0
    `;
    
    const equipResult = await executeQuery(getEquipQuery, [id]);
    const deliveryNoteId = equipResult.length > 0 ? equipResult[0].DeliveryNoteId : null;
    
    // Delete the equipment
    const query = `DELETE FROM Equipments WHERE Id = @param0`;
    await executeQuery(query, [id]);
    
    if (deliveryNoteId) {
      // Update DeliveryNote counts
      const updateQuery = `
        UPDATE DeliveryNotes
        SET 
          DeliveredEquipment = (
            SELECT COUNT(*) 
            FROM Equipments 
            WHERE DeliveryNoteId = @param0
          ),
          VerifiedEquipment = (
            SELECT COUNT(*) 
            FROM Equipments 
            WHERE DeliveryNoteId = @param0 AND IsVerified = 1
          ),
          Progress = (
            SELECT CAST(COUNT(*) * 100.0 / NULLIF(EstimatedEquipment, 0) AS int)
            FROM Equipments 
            WHERE DeliveryNoteId = @param0 AND IsVerified = 1
          ),
          UpdatedAt = GETDATE()
        WHERE Id = @param0
      `;
      
      await executeQuery(updateQuery, [deliveryNoteId]);
    }
    
    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

// Match equipment with estimated equipment
export const matchEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estimatedEquipmentId } = req.body;
    const { demoMode } = getSettings();
    
    if (!estimatedEquipmentId) {
      return res.status(400).json({ 
        error: true, 
        message: 'Se requiere estimatedEquipmentId' 
      });
    }
    
    if (demoMode) {
      // Return success in demo mode
      return res.json({ 
        message: 'Equipo emparejado correctamente',
        equipmentId: id,
        estimatedEquipmentId
      });
    }
    
    const query = `
      UPDATE Equipments
      SET 
        IsMatched = 1,
        EstimatedEquipmentId = @param1,
        UpdatedAt = GETDATE()
      WHERE Id = @param0
    `;
    
    await executeQuery(query, [id, estimatedEquipmentId]);
    
    // Update estimated equipment assigned count
    const updateEstimatedQuery = `
      UPDATE EstimatedEquipments
      SET 
        AssignedEquipmentCount = (
          SELECT COUNT(*) 
          FROM Equipments 
          WHERE EstimatedEquipmentId = @param0
        ),
        UpdatedAt = GETDATE()
      WHERE Id = @param0
    `;
    
    await executeQuery(updateEstimatedQuery, [estimatedEquipmentId]);
    
    res.json({ 
      message: 'Equipo emparejado correctamente',
      equipmentId: id,
      estimatedEquipmentId
    });
  } catch (error) {
    next(error);
  }
};

// Unmatch equipment
export const unmatchEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { demoMode } = getSettings();
    
    if (demoMode) {
      // Return success in demo mode
      return res.json({ 
        message: 'Emparejamiento desvinculado correctamente',
        equipmentId: id
      });
    }
    
    // First get the estimated equipment ID
    const getEquipQuery = `
      SELECT EstimatedEquipmentId 
      FROM Equipments 
      WHERE Id = @param0
    `;
    
    const equipResult = await executeQuery(getEquipQuery, [id]);
    const estimatedEquipmentId = equipResult.length > 0 ? equipResult[0].EstimatedEquipmentId : null;
    
    // Update equipment
    const query = `
      UPDATE Equipments
      SET 
        IsMatched = 0,
        EstimatedEquipmentId = NULL,
        UpdatedAt = GETDATE()
      WHERE Id = @param0
    `;
    
    await executeQuery(query, [id]);
    
    // If there was an estimated equipment ID, update its assigned count
    if (estimatedEquipmentId) {
      const updateEstimatedQuery = `
        UPDATE EstimatedEquipments
        SET 
          AssignedEquipmentCount = (
            SELECT COUNT(*) 
            FROM Equipments 
            WHERE EstimatedEquipmentId = @param0
          ),
          UpdatedAt = GETDATE()
        WHERE Id = @param0
      `;
      
      await executeQuery(updateEstimatedQuery, [estimatedEquipmentId]);
    }
    
    res.json({ 
      message: 'Emparejamiento desvinculado correctamente',
      equipmentId: id
    });
  } catch (error) {
    next(error);
  }
};

// Verify equipment
export const verifyEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { photoPath } = req.body;
    const { demoMode } = getSettings();
    
    if (demoMode) {
      // Return success in demo mode
      return res.json({ 
        message: 'Equipo verificado correctamente',
        equipmentId: id,
        isVerified: true,
        photoPath
      });
    }
    
    // Get delivery note ID
    const getEquipQuery = `
      SELECT DeliveryNoteId 
      FROM Equipments 
      WHERE Id = @param0
    `;
    
    const equipResult = await executeQuery(getEquipQuery, [id]);
    const deliveryNoteId = equipResult.length > 0 ? equipResult[0].DeliveryNoteId : null;
    
    if (!deliveryNoteId) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    
    // Update equipment
    const query = `
      UPDATE Equipments
      SET 
        IsVerified = 1,
        PhotoPath = @param1,
        UpdatedAt = GETDATE()
      WHERE Id = @param0
    `;
    
    await executeQuery(query, [id, photoPath]);
    
    // Update DeliveryNote verifiedEquipment count and progress
    const updateDNQuery = `
      UPDATE DeliveryNotes
      SET 
        VerifiedEquipment = (
          SELECT COUNT(*) 
          FROM Equipments 
          WHERE DeliveryNoteId = @param0 AND IsVerified = 1
        ),
        Progress = (
          SELECT CAST(COUNT(*) * 100.0 / NULLIF(EstimatedEquipment, 0) AS int)
          FROM Equipments 
          WHERE DeliveryNoteId = @param0 AND IsVerified = 1
        ),
        UpdatedAt = GETDATE()
      WHERE Id = @param0
    `;
    
    await executeQuery(updateDNQuery, [deliveryNoteId]);
    
    // Update Order progress
    const updateOrderQuery = `
      UPDATE Orders
      SET 
        Progress = (
          SELECT AVG(Progress)
          FROM DeliveryNotes
          WHERE OrderId = (
            SELECT OrderId 
            FROM DeliveryNotes 
            WHERE Id = @param0
          )
        ),
        UpdatedAt = GETDATE()
      WHERE Id = (
        SELECT OrderId 
        FROM DeliveryNotes 
        WHERE Id = @param0
      )
    `;
    
    await executeQuery(updateOrderQuery, [deliveryNoteId]);
    
    // Update Project progress
    const updateProjectQuery = `
      UPDATE Projects
      SET 
        Progress = (
          SELECT AVG(Progress)
          FROM Orders
          WHERE ProjectId = (
            SELECT p.Id 
            FROM Projects p
            JOIN Orders o ON o.ProjectId = p.Id
            JOIN DeliveryNotes dn ON dn.OrderId = o.Id
            WHERE dn.Id = @param0
          )
        ),
        UpdatedAt = GETDATE()
      WHERE Id = (
        SELECT p.Id 
        FROM Projects p
        JOIN Orders o ON o.ProjectId = p.Id
        JOIN DeliveryNotes dn ON dn.OrderId = o.Id
        WHERE dn.Id = @param0
      )
    `;
    
    await executeQuery(updateProjectQuery, [deliveryNoteId]);
    
    res.json({ 
      message: 'Equipo verificado correctamente',
      equipmentId: id,
      isVerified: true,
      photoPath
    });
  } catch (error) {
    next(error);
  }
};

// Automatic match of equipment using AI
export const automaticMatchEquipment = async (req, res, next) => {
  try {
    const { deliveryNoteId } = req.params;
    const { demoMode } = getSettings();
    
    if (demoMode) {
      // Return mock successful matches in demo mode
      // In a real implementation, this would use Mistral AI or similar
      return res.json({ 
        message: 'Equipos emparejados automáticamente',
        matchCount: Math.floor(Math.random() * 5) + 1,
        matches: {
          'demo-equip-1': 'demo-estimated-1',
          'demo-equip-2': 'demo-estimated-2'
        }
      });
    }
    
    // In a real implementation, this would:
    // 1. Get all unmatched equipment for this delivery note
    // 2. Get all estimated equipment for the related project with available slots
    // 3. Use ML/AI to match them based on type, model, etc.
    // 4. Update the matches in the database
    
    // For now, return a simple success response
    res.json({ 
      message: 'Equipos emparejados automáticamente',
      matchCount: 0,
      matches: {}
    });
  } catch (error) {
    next(error);
  }
};