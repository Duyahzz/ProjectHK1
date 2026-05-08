-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: courierxpress_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `shipments`
--

DROP TABLE IF EXISTS `shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipments` (
  `shipment_id` bigint NOT NULL AUTO_INCREMENT,
  `tracking_number` varchar(50) NOT NULL,
  `sender_customer_id` bigint NOT NULL,
  `receiver_customer_id` bigint NOT NULL,
  `shipment_type_id` bigint NOT NULL,
  `origin_branch_id` bigint NOT NULL,
  `assigned_agent_id` bigint DEFAULT NULL,
  `created_by_user_id` bigint DEFAULT NULL,
  `booking_source` enum('CUSTOMER_WEB','AGENT_COUNTER','ADMIN_SYSTEM') NOT NULL DEFAULT 'CUSTOMER_WEB',
  `confirmed_by_agent_id` bigint DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `weight` decimal(10,2) NOT NULL,
  `total_charge` decimal(12,2) NOT NULL,
  `parcel_name` varchar(150) DEFAULT NULL,
  `item_description` text,
  `current_status` enum('PENDING_CONFIRMATION','BOOKED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','DELAYED') DEFAULT 'PENDING_CONFIRMATION',
  `booking_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `expected_delivery_date` datetime DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`shipment_id`),
  UNIQUE KEY `tracking_number` (`tracking_number`),
  KEY `sender_customer_id` (`sender_customer_id`),
  KEY `receiver_customer_id` (`receiver_customer_id`),
  KEY `shipment_type_id` (`shipment_type_id`),
  KEY `origin_branch_id` (`origin_branch_id`),
  KEY `assigned_agent_id` (`assigned_agent_id`),
  KEY `fk_shipments_created_by` (`created_by_user_id`),
  KEY `fk_shipments_confirmed_by` (`confirmed_by_agent_id`),
  CONSTRAINT `fk_shipments_confirmed_by` FOREIGN KEY (`confirmed_by_agent_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_shipments_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`sender_customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`receiver_customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `shipments_ibfk_3` FOREIGN KEY (`shipment_type_id`) REFERENCES `shipment_types` (`shipment_type_id`),
  CONSTRAINT `shipments_ibfk_4` FOREIGN KEY (`origin_branch_id`) REFERENCES `branches` (`branch_id`),
  CONSTRAINT `shipments_ibfk_5` FOREIGN KEY (`assigned_agent_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
INSERT INTO `shipments` VALUES (1,'TRK001',1,2,1,1,2,NULL,'CUSTOMER_WEB',NULL,NULL,0.50,35000.00,NULL,NULL,'BOOKED','2026-04-10 09:00:00','2026-04-12 17:00:00','Handle with care'),(2,'TRK002',2,3,2,2,3,NULL,'CUSTOMER_WEB',NULL,NULL,1.20,60000.00,NULL,NULL,'IN_TRANSIT','2026-04-11 10:30:00','2026-04-13 17:00:00','Normal parcel'),(3,'TRK003',3,4,3,3,2,NULL,'CUSTOMER_WEB',NULL,NULL,2.50,90000.00,NULL,NULL,'DELIVERED','2026-04-09 08:15:00','2026-04-10 17:00:00','Urgent shipment'),(4,'TRK004',1,5,2,1,2,NULL,'CUSTOMER_WEB',NULL,NULL,3.00,70000.00,NULL,NULL,'CANCELLED','2026-04-12 14:00:00','2026-04-15 17:00:00','Customer cancelled'),(5,'TRK20260430104423',1,5,1,1,2,NULL,'CUSTOMER_WEB',NULL,NULL,1.00,60000.00,NULL,NULL,'BOOKED','2026-04-30 10:44:23','2026-04-30 00:00:00','abc'),(6,'TRK20260430104623',4,5,1,1,2,NULL,'CUSTOMER_WEB',NULL,NULL,1.00,50000.00,NULL,NULL,'BOOKED','2026-04-30 10:46:23','2026-04-30 00:00:00','anc'),(7,'TRK20260508090632',3,5,1,1,2,NULL,'CUSTOMER_WEB',NULL,NULL,1.00,50000.00,NULL,NULL,'DELIVERED','2026-05-08 09:06:32','2026-05-08 00:00:00','1231231');
/*!40000 ALTER TABLE `shipments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08 17:53:39
