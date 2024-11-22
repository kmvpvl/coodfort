-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: sql-db
-- Время создания: Сен 13 2024 г., 07:14
-- Версия сервера: 11.3.2-MariaDB-1:11.3.2+maria~ubu2204
-- Версия PHP: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `cootford`
--
CREATE DATABASE IF NOT EXISTS `cootford` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `cootford`;

-- --------------------------------------------------------

--
-- Структура таблицы `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `eatery_id` uuid NOT NULL,
  `mnemonic_number` varchar(1024) NOT NULL,
  `main_guest_id` binary(16) NOT NULL,
  `time_start` datetime NOT NULL,
  `time_end` datetime NOT NULL,
  `wf_status` varchar(128) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `changed` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `eatery_id` (`eatery_id`),
  KEY `wf_status` (`wf_status`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `booking_statuses`
--

DROP TABLE IF EXISTS `booking_statuses`;
CREATE TABLE IF NOT EXISTS `booking_statuses` (
  `name` varchar(128) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `eateries`
--

DROP TABLE IF EXISTS `eateries`;
CREATE TABLE IF NOT EXISTS `eateries` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `name` varchar(1024) NOT NULL,
  `rating` float DEFAULT NULL,
  `blocked` tinyint(1) NOT NULL DEFAULT 0,
  `awards` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`awards`)),
  `url` varchar(2048) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `descriptions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`descriptions`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `cuisines` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cuisines`)),
  `avgbillwoalcohol` float DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `changed` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `tables`
--

DROP TABLE IF EXISTS `tables`;
CREATE TABLE IF NOT EXISTS `tables` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `eatery_id` uuid NOT NULL,
  `name` varchar(1024) NOT NULL,
  `blocked` tinyint(1) NOT NULL DEFAULT 0,
  `guest_count_max` int(11) NOT NULL,
  `guest_count_comfort` int(11) NOT NULL,
  `guest_count_min` int(11) NOT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `can_be_moved` tinyint(1) NOT NULL DEFAULT 0,
  `privateness` varchar(128) NOT NULL,
  `location` varchar(128) NOT NULL,
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`schedule`)),
  `guest_can_smoke` tinyint(1) NOT NULL DEFAULT 0,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  PRIMARY KEY (`id`),
  KEY `eatery_id` (`eatery_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`wf_status`) REFERENCES `booking_statuses` (`name`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`eatery_id`) REFERENCES `eateries` (`id`);

--
-- Ограничения внешнего ключа таблицы `tables`
--
ALTER TABLE `tables`
  ADD CONSTRAINT `tables_ibfk_1` FOREIGN KEY (`eatery_id`) REFERENCES `eateries` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
