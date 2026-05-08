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
-- Table structure for table `shipment_status_history`
--

DROP TABLE IF EXISTS `shipment_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_status_history` (
  `history_id` bigint NOT NULL AUTO_INCREMENT,
  `shipment_id` bigint NOT NULL,
  `status` enum('PENDING_CONFIRMATION','BOOKED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','DELAYED') NOT NULL,
  `status_note` varchar(255) DEFAULT NULL,
  `updated_by_user_id` bigint NOT NULL,
  `branch_id` bigint DEFAULT NULL,
  `event_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `shipment_id` (`shipment_id`),
  KEY `updated_by_user_id` (`updated_by_user_id`),
  KEY `fk_history_branch` (`branch_id`),
  CONSTRAINT `fk_history_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`),
  CONSTRAINT `shipment_status_history_ibfk_1` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`shipment_id`),
  CONSTRAINT `shipment_status_history_ibfk_2` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_status_history`
--

LOCK TABLES `shipment_status_history` WRITE;
/*!40000 ALTER TABLE `shipment_status_history` DISABLE KEYS */;
INSERT INTO `shipment_status_history` VALUES (1,1,'BOOKED','Shipment created successfully',2,NULL,'2026-04-10 09:00:00'),(2,2,'BOOKED','Shipment booked at branch',3,NULL,'2026-04-11 10:30:00'),(3,2,'IN_TRANSIT','Shipment is on the way',3,NULL,'2026-04-11 15:00:00'),(4,3,'BOOKED','Shipment booked',2,NULL,'2026-04-09 08:15:00'),(5,3,'IN_TRANSIT','Shipment left branch',2,NULL,'2026-04-09 12:00:00'),(6,3,'DELIVERED','Shipment delivered successfully',2,NULL,'2026-04-10 16:30:00'),(7,4,'BOOKED','Shipment booked',2,NULL,'2026-04-12 14:00:00'),(8,4,'CANCELLED','Shipment cancelled by customer',1,NULL,'2026-04-12 16:00:00'),(9,5,'BOOKED','Shipment created successfully',2,NULL,'2026-04-30 10:44:23'),(10,6,'BOOKED','Shipment created successfully',2,NULL,'2026-04-30 10:46:23'),(11,7,'BOOKED','Shipment created successfully',2,NULL,'2026-05-08 09:06:32'),(12,7,'DELIVERED',NULL,1,NULL,'2026-05-08 09:10:52');
/*!40000 ALTER TABLE `shipment_status_history` ENABLE KEYS */;
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
