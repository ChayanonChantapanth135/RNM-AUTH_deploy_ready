-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 07, 2026 at 04:55 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myapp_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `details`, `created_at`) VALUES
(1, 1, 'Create New Project', 'Created project: Test Proj', '2026-07-13 03:43:20'),
(2, 1, 'Create New Project', 'Created project: Pubg', '2026-07-13 03:44:10'),
(3, 1, 'Edit Project', 'Edited project ID: 1', '2026-07-13 03:53:08'),
(4, 1, 'Logout', 'User logged out: james C', '2026-07-13 04:03:17'),
(5, 1, 'Login', 'User logged in: james C', '2026-07-13 04:03:19'),
(6, 1, 'Logout', 'User logged out: james C', '2026-07-13 04:06:12'),
(7, 1, 'Login', 'User logged in: james C', '2026-07-13 04:06:14'),
(8, 1, 'Login', 'User logged in: james C', '2026-07-13 04:15:35'),
(9, 3, 'Create New Project', 'Created project: Marketing Campaign', '2026-07-13 04:15:35'),
(10, 5, 'Upload File', 'Uploaded file: assets_design.fig', '2026-07-13 04:15:35'),
(11, 6, 'Create Task', 'Created task: Design login UI mockup', '2026-07-13 04:15:35'),
(12, 9, 'Edit Task', 'Updated task status to \'In Progress\'', '2026-07-13 04:15:35'),
(13, 4, 'Logout', 'User logged out: Erick h', '2026-07-13 04:15:35'),
(14, 12, 'Delete Project', 'Deleted project: Sandbox Testing', '2026-07-13 04:15:35'),
(15, 2, 'Add User', 'Created user account: Somchai Dev', '2026-07-13 04:15:35'),
(16, 1, 'Logout', 'User logged out: james C', '2026-07-13 04:38:46'),
(18, 1, 'Login', 'User logged in: james C', '2026-07-13 05:33:13'),
(19, 1, 'Logout', 'User logged out: james C', '2026-07-13 06:06:11'),
(23, 1, 'Login', 'User logged in: james C', '2026-07-13 06:38:28'),
(24, 1, 'Delete Project', 'Deleted project: Test Proj', '2026-07-13 06:41:31'),
(25, 1, 'Create New Project', 'Created project: TestPJ', '2026-07-13 06:41:54'),
(26, 1, 'Create New Project', 'Created project: TestPG_3', '2026-07-13 06:42:41'),
(27, 1, 'Create New Project', 'Created project: 142', '2026-07-13 07:06:00'),
(28, 1, 'Logout', 'User logged out: james C', '2026-07-13 07:07:38'),
(30, 1, 'Login', 'User logged in: james C', '2026-07-13 07:07:42'),
(31, 1, 'Logout', 'User logged out: james C', '2026-07-13 07:09:07'),
(32, 1, 'Login', 'User logged in: james C', '2026-07-13 07:09:12'),
(33, 1, 'Logout', 'User logged out: james C', '2026-07-13 07:45:07'),
(37, 1, 'Login', 'User logged in: james C', '2026-07-13 07:45:10'),
(38, 1, 'Edit Project', 'Edited project ID: 8', '2026-07-13 07:55:12'),
(39, 1, 'Edit Project', 'Edited project ID: 7', '2026-07-13 08:02:18'),
(40, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-13 08:02:26'),
(41, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-13 08:02:30'),
(42, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-13 08:02:34'),
(43, 1, 'Logout', 'User logged out: james C', '2026-07-13 08:05:29'),
(45, 1, 'Login', 'User logged in: james C', '2026-07-13 08:05:30'),
(46, 1, 'Logout', 'User logged out: james C', '2026-07-13 08:25:34'),
(50, 1, 'Login', 'User logged in: james C', '2026-07-13 08:25:38'),
(51, 1, 'Delete Project', 'Deleted project: Pubg', '2026-07-13 08:45:27'),
(52, 1, 'Logout', 'User logged out: james C', '2026-07-13 08:58:52'),
(54, 1, 'Login', 'User logged in: james C', '2026-07-13 08:58:57'),
(55, 1, 'Logout', 'User logged out: james C', '2026-07-13 09:20:08'),
(57, 1, 'Login', 'User logged in: james C', '2026-07-13 09:20:57'),
(58, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-13 09:24:18'),
(59, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-13 09:24:52'),
(60, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-13 09:24:57'),
(61, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-13 09:25:02'),
(62, 1, 'Delete Project', 'Deleted project: SEO Optimization Campaign', '2026-07-13 09:36:52'),
(63, 1, 'Logout', 'User logged out: james C', '2026-07-13 09:41:07'),
(65, 1, 'Login', 'User logged in: james C', '2026-07-13 09:43:29'),
(66, 1, 'Logout', 'User logged out: james C', '2026-07-13 09:57:51'),
(67, 1, 'Login', 'User logged in: james C', '2026-07-13 10:00:18'),
(68, 1, 'Logout', 'User logged out: james C', '2026-07-13 10:02:24'),
(69, 1, 'Login', 'User logged in: james C', '2026-07-13 10:03:32'),
(70, 1, 'Logout', 'User logged out: james C', '2026-07-14 02:04:07'),
(74, 1, 'Login', 'User logged in: james C', '2026-07-14 02:04:14'),
(75, 1, 'Logout', 'User logged out: james C', '2026-07-14 02:09:12'),
(76, 1, 'Login', 'User logged in: james C', '2026-07-14 02:09:15'),
(77, 1, 'Logout', 'User logged out: james C', '2026-07-14 02:10:02'),
(78, 1, 'Login', 'User logged in: james C', '2026-07-14 02:10:15'),
(79, 1, 'Logout', 'User logged out: james C', '2026-07-14 02:30:57'),
(81, 2, 'Login', 'User logged in: admin admin', '2026-07-14 02:34:19'),
(82, 1, 'Login', 'User logged in: james C', '2026-07-14 02:38:56'),
(83, 1, 'Import Users', 'Bulk imported: 1 new, updated: 1 existing', '2026-07-14 02:41:47'),
(84, 1, 'Import Users', 'Bulk imported: 2 new, updated: 0 existing', '2026-07-14 02:51:17'),
(85, 1, 'Import Users', 'Bulk imported: 2 new, updated: 1 existing', '2026-07-14 03:04:39'),
(86, 1, 'Logout', 'User logged out: james C', '2026-07-14 03:18:02'),
(87, 1, 'Login', 'User logged in: james C', '2026-07-14 03:21:43'),
(88, 1, 'Edit Project', 'Edited project ID: 6', '2026-07-14 03:24:21'),
(89, 1, 'Edit Project', 'Edited project ID: 9', '2026-07-14 03:24:30'),
(90, 1, 'Edit Project', 'Edited project ID: 12', '2026-07-14 03:24:40'),
(91, 1, 'Edit Project', 'Edited project ID: 15', '2026-07-14 03:24:44'),
(92, 1, 'Logout', 'User logged out: james C', '2026-07-14 03:42:02'),
(94, 1, 'Login', 'User logged in: james C', '2026-07-14 03:45:24'),
(95, 1, 'Logout', 'User logged out: james C', '2026-07-14 03:45:31'),
(96, 1, 'Login', 'User logged in: james C', '2026-07-14 03:45:34'),
(97, 1, 'Logout', 'User logged out: james C', '2026-07-14 03:47:05'),
(98, 1, 'Login', 'User logged in: james C', '2026-07-14 03:47:07'),
(99, 1, 'Logout', 'User logged out: james C', '2026-07-14 03:47:10'),
(100, 1, 'Login', 'User logged in: james C', '2026-07-14 03:47:19'),
(101, 1, 'Logout', 'User logged out: james C', '2026-07-14 04:01:53'),
(102, 7, 'Login', 'User logged in: Ling J', '2026-07-14 04:02:01'),
(103, 7, 'Logout', 'User logged out: Ling J', '2026-07-14 04:02:16'),
(104, 1, 'Login', 'User logged in: james C', '2026-07-14 04:02:19'),
(105, 1, 'Logout', 'User logged out: james C', '2026-07-14 04:23:02'),
(106, 1, 'Login', 'User logged in: james C', '2026-07-14 05:42:51'),
(107, 1, 'Logout', 'User logged out: james C', '2026-07-14 06:41:07'),
(108, 1, 'Login', 'User logged in: james C', '2026-07-14 06:54:57'),
(109, 1, 'Logout', 'User logged out: james C', '2026-07-14 07:15:02'),
(110, 1, 'Login', 'User logged in: james C', '2026-07-14 07:17:19'),
(111, 1, 'Logout', 'User logged out: james C', '2026-07-14 07:38:02'),
(112, 1, 'Login', 'User logged in: james C', '2026-07-14 08:02:20'),
(113, 1, 'Logout', 'User logged out: james C', '2026-07-14 08:02:22'),
(114, 1, 'Login', 'User logged in: james C', '2026-07-14 08:03:54'),
(115, 1, 'Logout', 'User logged out: james C', '2026-07-14 08:06:08'),
(116, 1, 'Login', 'User logged in: james C', '2026-07-14 08:06:36'),
(117, 1, 'Logout', 'User logged out: james C', '2026-07-14 08:27:02'),
(118, 1, 'Login', 'User logged in: james C', '2026-07-14 08:30:38'),
(119, 1, 'Logout', 'User logged out: james C', '2026-07-14 08:36:47'),
(120, 1, 'Login', 'User logged in: james C', '2026-07-14 08:36:55'),
(121, 1, 'Import Users', 'Bulk imported: 20 new, updated: 0 existing', '2026-07-14 08:45:28'),
(122, 1, 'Logout', 'User logged out: james C', '2026-07-14 08:57:02'),
(123, 1, 'Login', 'User logged in: james C', '2026-07-14 08:57:12'),
(124, 1, 'Logout', 'User logged out: james C', '2026-07-14 08:57:15'),
(125, 2, 'Reset Password', 'User reset password for: admin@example.com', '2026-07-14 09:02:40'),
(126, 2, 'Login', 'User logged in: admin admin', '2026-07-14 09:02:57'),
(127, 2, 'Logout', 'User logged out: admin admin', '2026-07-20 02:04:16'),
(128, 6, 'Login', 'User logged in: Snake S', '2026-07-14 09:04:08'),
(129, 6, 'Logout', 'User logged out: Snake S', '2026-07-14 09:04:19'),
(130, 1, 'Login', 'User logged in: james C', '2026-07-14 09:04:23'),
(131, 1, 'Logout', 'User logged out: james C', '2026-07-14 09:12:26'),
(132, 1, 'Login', 'User logged in: james C', '2026-07-14 09:12:34'),
(133, 1, 'Logout', 'User logged out: james C', '2026-07-14 09:12:38'),
(134, 1, 'Login', 'User logged in: james C', '2026-07-14 09:28:19'),
(135, 1, 'Logout', 'User logged out: james C', '2026-07-14 09:28:26'),
(136, 1, 'Login', 'User logged in: james C', '2026-07-14 09:29:47'),
(137, 1, 'Logout', 'User logged out: james C', '2026-07-14 09:49:48'),
(138, 1, 'Login', 'User logged in: james C', '2026-07-14 10:14:22'),
(139, 1, 'Logout', 'User logged out: james C', '2026-07-14 10:19:59'),
(140, 1, 'Login', 'User logged in: james C', '2026-07-14 10:23:21'),
(141, 1, 'Logout', 'User logged out: james C', '2026-07-14 10:27:41'),
(142, 1, 'Login', 'User logged in: james C', '2026-07-14 10:30:06'),
(143, 1, 'Logout', 'User logged out: james C', '2026-07-15 01:51:25'),
(145, 1, 'Login', 'User logged in: james C', '2026-07-15 01:54:57'),
(146, 1, 'Logout', 'User logged out: james C', '2026-07-15 02:25:46'),
(147, 1, 'Login', 'User logged in: james C', '2026-07-15 06:41:11'),
(148, 1, 'Logout', 'User logged out: james C', '2026-07-15 06:43:34'),
(149, 1, 'Login', 'User logged in: james C', '2026-07-15 06:43:52'),
(150, 1, 'Logout', 'User logged out: james C', '2026-07-15 06:44:18'),
(151, 1, 'Login', 'User logged in: james C', '2026-07-15 06:44:31'),
(152, 1, 'Logout', 'User logged out: james C', '2026-07-15 06:48:28'),
(153, 1, 'Login', 'User logged in: james C', '2026-07-15 07:08:02'),
(154, 1, 'Logout', 'User logged out: james C', '2026-07-15 07:10:00'),
(155, 1, 'Login', 'User logged in: james C', '2026-07-15 07:35:35'),
(156, 1, 'Logout', 'User logged out: james C', '2026-07-15 07:38:54'),
(157, 41, 'Reset Password', 'User reset password for: chayanon.chantapanth@g.swu.ac.th', '2026-07-15 08:02:05'),
(158, 41, 'Login', 'User logged in: chaya chanta', '2026-07-15 08:02:32'),
(159, 41, 'Logout', 'User logged out: chaya chanta', '2026-07-15 08:08:11'),
(160, 3, 'Login', 'User logged in: Ada Wang', '2026-07-15 08:08:24'),
(161, 3, 'Reset Password First Time', 'User reset password on first login for: Ada.Wang@gmail.com', '2026-07-15 08:08:56'),
(162, 3, 'Logout', 'User logged out: Ada Wang', '2026-07-15 08:09:28'),
(163, 1, 'Login', 'User logged in: james C', '2026-07-15 08:09:42'),
(164, 1, 'Logout', 'User logged out: james C', '2026-07-15 08:18:29'),
(165, 1, 'Login', 'User logged in: james C', '2026-07-15 08:18:49'),
(166, 1, 'Logout', 'User logged out: james C', '2026-07-15 08:36:06'),
(167, 1, 'Login', 'User logged in: james C', '2026-07-15 08:38:24'),
(168, 1, 'Logout', 'User logged out: james C', '2026-07-15 08:41:06'),
(169, 43, 'Login', 'User logged in: jin woo sung', '2026-07-15 08:41:41'),
(170, 43, 'Reset Password First Time', 'User reset password on first login for: chayanon.sent@gmail.com', '2026-07-15 08:42:03'),
(171, 43, 'Logout', 'User logged out: jin woo sung', '2026-07-15 08:42:24'),
(172, 43, 'Reset Password', 'User reset password for: chayanon.sent@gmail.com', '2026-07-15 08:43:01'),
(173, 43, 'Login', 'User logged in: jin woo sung', '2026-07-15 08:43:20'),
(174, 43, 'Logout', 'User logged out: jin woo sung', '2026-07-15 08:54:35'),
(175, 1, 'Reset Password', 'User reset password for: chayanon.1547@gmail.com', '2026-07-15 08:56:13'),
(176, 1, 'Login', 'User logged in: james C', '2026-07-15 08:56:21'),
(177, 1, 'Logout', 'User logged out: james C', '2026-07-15 09:05:45'),
(178, 44, 'Login', 'User logged in: Yoichi Isagi', '2026-07-15 09:05:58'),
(179, 44, 'Reset Password First Time', 'User reset password on first login for: atera1547@gmail.com', '2026-07-15 09:06:10'),
(180, 44, 'Logout', 'User logged out: Yoichi Isagi', '2026-07-15 09:06:17'),
(181, 44, 'Reset Password', 'User reset password for: atera1547@gmail.com', '2026-07-15 09:11:03'),
(182, 6, 'Login', 'User logged in: Snake S', '2026-07-15 09:11:22'),
(183, 6, 'Reset Password First Time', 'User reset password on first login for: Snake.S@gmail.com', '2026-07-15 09:14:34'),
(184, 6, 'Logout', 'User logged out: Snake S', '2026-07-15 09:14:42'),
(185, 1, 'Login', 'User logged in: james C', '2026-07-15 09:14:50'),
(186, 1, 'Logout', 'User logged out: james C', '2026-07-15 09:18:10'),
(187, 45, 'Login', 'User logged in: Yuji Itadori', '2026-07-15 09:18:30'),
(188, 45, 'Reset Password First Time', 'User reset password on first login for: ausa.c2512@gmail.com', '2026-07-15 09:18:44'),
(189, 45, 'Logout', 'User logged out: Yuji Itadori', '2026-07-15 09:18:52'),
(190, 45, 'Reset Password', 'User reset password for: ausa.c2512@gmail.com', '2026-07-15 09:19:26'),
(191, 45, 'Login', 'User logged in: Yuji Itadori', '2026-07-15 09:19:35'),
(192, 45, 'Logout', 'User logged out: Yuji Itadori', '2026-07-15 09:19:38'),
(193, 1, 'Login', 'User logged in: james C', '2026-07-15 09:19:46'),
(194, 1, 'Logout', 'User logged out: james C', '2026-07-15 09:37:25'),
(195, 48, 'Login', 'User logged in: Megumin Explosion', '2026-07-15 09:37:43'),
(196, 48, 'Reset Password First Time', 'User reset password on first login for: linksaber.1547@gmail.com', '2026-07-15 09:37:56'),
(197, 48, 'Logout', 'User logged out: Megumin Explosion', '2026-07-15 09:39:18'),
(198, 48, 'Reset Password', 'User reset password for: linksaber.1547@gmail.com', '2026-07-15 10:05:24'),
(199, 42, 'Login', 'User logged in: Satoru Gojo', '2026-07-15 09:42:49'),
(200, 42, 'Reset Password First Time', 'User reset password on first login for: linkzy1547@gmail.com', '2026-07-15 09:43:00'),
(201, 42, 'Logout', 'User logged out: Satoru Gojo', '2026-07-15 09:43:06'),
(202, 42, 'Login', 'User logged in: Satoru Gojo', '2026-07-15 09:43:15'),
(203, 42, 'Logout', 'User logged out: Satoru Gojo', '2026-07-15 09:43:30'),
(204, 42, 'Reset Password', 'User reset password for: linkzy1547@gmail.com', '2026-07-15 09:44:43'),
(205, 42, 'Login', 'User logged in: Satoru Gojo', '2026-07-15 09:45:01'),
(206, 42, 'Logout', 'User logged out: Satoru Gojo', '2026-07-15 09:45:03'),
(207, 1, 'Login', 'User logged in: james C', '2026-07-15 09:45:10'),
(208, 1, 'Logout', 'User logged out: james C', '2026-07-15 09:59:53'),
(209, 48, 'Login', 'User logged in: Megumin Explosion', '2026-07-15 10:05:36'),
(210, 48, 'Logout', 'User logged out: Megumin Explosion', '2026-07-15 10:25:59'),
(211, 1, 'Login', 'User logged in: james C', '2026-07-15 10:26:38'),
(212, 1, 'Logout', 'User logged out: james C', '2026-07-15 10:27:31'),
(213, 45, 'Reset Password', 'User reset password for: ausa.c2512@gmail.com', '2026-07-15 10:28:26'),
(214, 1, 'Login', 'User logged in: james C', '2026-07-16 02:18:18'),
(215, 1, 'Logout', 'User logged out: james C', '2026-07-16 02:34:02'),
(216, 5, 'Login', 'User logged in: Dragon G', '2026-07-16 02:35:58'),
(217, 5, 'Logout', 'User logged out: Dragon G', '2026-07-16 02:44:00'),
(218, 5, 'Login', 'User logged in: Dragon G', '2026-07-16 02:44:29'),
(219, 5, 'Logout', 'User logged out: Dragon G', '2026-07-16 02:51:05'),
(220, 1, 'Login', 'User logged in: james C', '2026-07-16 02:51:14'),
(221, 1, 'Logout', 'User logged out: james C', '2026-07-16 04:28:01'),
(223, 1, 'Login', 'User logged in: james C', '2026-07-16 05:41:26'),
(224, 1, 'Logout', 'User logged out: james C', '2026-07-16 06:01:59'),
(226, 1, 'Login', 'User logged in: james C', '2026-07-16 06:17:14'),
(227, 1, 'Logout', 'User logged out: james C', '2026-07-16 06:19:28'),
(228, 1, 'Login', 'User logged in: james C', '2026-07-16 06:47:22'),
(229, 1, 'Logout', 'User logged out: james C', '2026-07-16 07:22:50'),
(230, 1, 'Login', 'User logged in: james C', '2026-07-16 08:39:21'),
(231, 1, 'Logout', 'User logged out: james C', '2026-07-16 09:00:01'),
(232, 1, 'Login', 'User logged in: james C', '2026-07-16 09:10:10'),
(233, 1, 'Logout', 'User logged out: james C', '2026-07-16 09:30:11'),
(235, 1, 'Login', 'User logged in: james C', '2026-07-16 09:30:23'),
(236, 1, 'Logout', 'User logged out: james C', '2026-07-17 01:49:13'),
(240, 42, 'Reset Password', 'User reset password for: linkzy1547@gmail.com', '2026-07-17 03:05:37'),
(241, 42, 'Login', 'User logged in: Satoru Gojo', '2026-07-17 03:05:53'),
(242, 42, 'Logout', 'User logged out: Satoru Gojo', '2026-07-17 03:35:05'),
(243, 42, 'Reset Password', 'User reset password for: linkzy1547@gmail.com', '2026-07-17 03:38:52'),
(244, 42, 'Login', 'User logged in: Satoru Gojo', '2026-07-17 03:39:05'),
(245, 42, 'Logout', 'User logged out: Satoru Gojo', '2026-07-17 03:45:23'),
(246, 1, 'Login', 'User logged in: james C', '2026-07-17 04:13:49'),
(247, 1, 'Logout', 'User logged out: james C', '2026-07-17 04:33:49'),
(248, 1, 'Login', 'User logged in: james C', '2026-07-17 07:14:30'),
(249, 1, 'Logout', 'User logged out: james C', '2026-07-17 07:34:56'),
(251, 1, 'Login', 'User logged in: james C', '2026-07-17 08:04:23'),
(252, 1, 'Logout', 'User logged out: james C', '2026-07-17 08:04:41'),
(253, 3, 'Login', 'User logged in: Ada Wang', '2026-07-17 08:35:06'),
(254, 3, 'Reset Password First Time', 'User reset password on first login for: Ada.Wang@gmail.com', '2026-07-17 08:35:17'),
(255, 3, 'Create New Project', 'Created project: Wow', '2026-07-17 08:41:23'),
(256, 3, 'Logout', 'User logged out: Ada Wang', '2026-07-17 08:56:28'),
(257, 1, 'Login', 'User logged in: james C', '2026-07-17 08:57:07'),
(258, 1, 'Logout', 'User logged out: james C', '2026-07-20 01:41:16'),
(262, 1, 'Login', 'User logged in: james C', '2026-07-20 01:41:32'),
(263, 1, 'Logout', 'User logged out: james C', '2026-07-20 02:40:53'),
(264, 1, 'Login', 'User logged in: james C', '2026-07-20 02:43:04'),
(265, 1, 'Create Task Success', 'Created task: แก้งานVideo under project ID: 16', '2026-07-20 03:10:27'),
(266, 1, 'Edit Project', 'Edited project ID: 16', '2026-07-20 03:15:03'),
(267, 1, 'Edit Project', 'Edited project ID: 11', '2026-07-20 03:23:25'),
(268, 1, 'Create Task Success', 'Created task: ใส่ Sub Title under project ID: 16', '2026-07-20 03:26:13'),
(269, 1, 'Update Task Status', 'Updated task \"แก้งานVideo\" status to \"Completed\"', '2026-07-20 03:34:57'),
(270, 1, 'Update Task Status', 'Updated task \"แก้งานVideo\" status to \"In Progress\"', '2026-07-20 03:39:52'),
(271, 1, 'Update Task Status', 'Updated task \"แก้งานVideo\" status to \"Reviewing\"', '2026-07-20 03:44:08'),
(272, 1, 'Update Task Status', 'Updated task \"แก้งานVideo\" status to \"Completed\"', '2026-07-20 03:45:08'),
(273, 1, 'Update Task Status', 'Updated task \"แก้งานVideo\" status to \"Reviewing\"', '2026-07-20 03:47:42'),
(274, 1, 'Update Task Status', 'Updated task \"แก้งานVideo\" status to \"Completed\"', '2026-07-20 03:47:46'),
(275, 1, 'Edit Project', 'Edited project ID: 14', '2026-07-20 03:48:01'),
(276, 1, 'Delete Project', 'Deleted project: Video Production Promo', '2026-07-20 03:48:37'),
(277, 1, 'Edit Project', 'Edited project ID: 16', '2026-07-20 03:56:33'),
(278, 1, 'Update Task Status', 'Updated task \"ใส่ Sub Title\" status to \"Completed\"', '2026-07-20 03:56:55'),
(279, 1, 'Edit Project', 'Edited project ID: 16', '2026-07-20 03:57:04'),
(280, 1, 'Update Task Status', 'Updated task \"ใส่ Sub Title\" status to \"Reviewing\"', '2026-07-20 03:57:13'),
(281, 1, 'Create New Project', 'Created project: Cybersecurity', '2026-07-20 04:08:26'),
(282, 1, 'Logout', 'User logged out: james C', '2026-07-20 04:19:14'),
(284, 1, 'Login', 'User logged in: james C', '2026-07-20 06:55:12'),
(285, 1, 'Delete User', 'Deleted user: Grajung G (Grajung.G@gmail.com)', '2026-07-20 07:35:28'),
(286, 1, 'Create User', 'Created user: Verajit V (Verajit.V@gmail.com)', '2026-07-20 07:36:23'),
(287, 1, 'Edit User', 'Edited user ID: 50 (Verajit V)', '2026-07-20 07:36:42'),
(288, 1, 'Activate User', 'Activated user: Verajit V (Verajit.V@gmail.com)', '2026-07-20 07:38:41'),
(289, 1, 'Suspend User', 'Suspended user: Dragon G (Dragon.G@gmail.com)', '2026-07-20 07:45:22'),
(290, 1, 'Suspend User', 'Suspended user: Snake S (Snake.S@gmail.com)', '2026-07-20 07:45:24'),
(291, 1, 'Activate User', 'Activated user: Dragon G (Dragon.G@gmail.com)', '2026-07-20 07:45:41'),
(292, 1, 'Activate User', 'Activated user: Snake S (Snake.S@gmail.com)', '2026-07-20 07:45:42'),
(293, 1, 'Logout', 'User logged out: james C', '2026-07-20 08:12:54'),
(295, 1, 'Login', 'User logged in: james C', '2026-07-20 08:38:14'),
(296, 1, 'Logout', 'User logged out: james C', '2026-07-20 08:58:55'),
(297, 1, 'Login', 'User logged in: james C', '2026-07-20 09:35:43'),
(298, 1, 'Logout', 'User logged out: james C', '2026-07-20 09:55:56'),
(300, 1, 'Login', 'User logged in: james C', '2026-07-20 09:59:33'),
(301, 1, 'Delete User', 'Deleted user: Verajit V (Verajit.V@gmail.com)', '2026-07-20 10:00:52'),
(302, 1, 'Create Task Success', 'Created task: แก้งาน under project ID: 17', '2026-07-20 10:22:49'),
(303, 1, 'Update Task Status', 'Updated task \"แก้งาน\" status to \"In Progress\"', '2026-07-20 10:23:03'),
(304, 1, 'Login', 'User logged in: james C', '2026-07-21 01:57:25'),
(305, 1, 'Update Task Status', 'Updated task \"แก้งาน\" status to \"Completed\"', '2026-07-21 01:57:54'),
(306, 1, 'Edit Project', 'Edited project ID: 17', '2026-07-21 01:58:05'),
(307, 1, 'Logout', 'User logged out: james C', '2026-07-21 02:55:50'),
(308, 1, 'Login', 'User logged in: james C', '2026-07-21 03:33:11'),
(309, 1, 'Logout', 'User logged out: james C', '2026-07-21 03:34:00'),
(310, 1, 'Login', 'User logged in: james C', '2026-07-21 03:35:29'),
(311, 1, 'Logout', 'User logged out: james C', '2026-07-21 03:35:55'),
(312, 1, 'Login', 'User logged in: james C', '2026-07-21 03:41:28'),
(313, 1, 'Logout', 'User logged out: james C', '2026-07-21 03:42:53'),
(314, 1, 'Login', 'User logged in: james C', '2026-07-21 03:44:20'),
(315, 1, 'Logout', 'User logged out: james C', '2026-07-21 04:04:50'),
(317, 1, 'Login', 'User logged in: james C', '2026-07-21 04:13:08'),
(318, 1, 'Logout', 'User logged out: james C', '2026-07-21 04:33:50'),
(319, 1, 'Login', 'User logged in: james C', '2026-07-21 05:52:08'),
(320, 1, 'Logout', 'User logged out: james C', '2026-07-21 06:12:50'),
(321, 1, 'Login', 'User logged in: james C', '2026-07-21 06:34:40'),
(322, 1, 'Logout', 'User logged out: james C', '2026-07-21 07:13:50'),
(323, 1, 'Login', 'User logged in: james C', '2026-07-21 08:23:29'),
(324, 1, 'Logout', 'User logged out: james C', '2026-07-21 08:43:28'),
(325, 1, 'Login', 'User logged in: james C', '2026-07-21 08:47:02'),
(326, 1, 'Logout', 'User logged out: james C', '2026-07-21 09:03:02'),
(327, 1, 'Login', 'User logged in: james C', '2026-07-21 09:03:43'),
(328, 1, 'Logout', 'User logged out: james C', '2026-07-21 09:05:08'),
(329, 1, 'Login', 'User logged in: james C', '2026-07-21 09:05:25'),
(330, 1, 'Logout', 'User logged out: james C', '2026-07-21 09:09:08'),
(331, 1, 'Login', 'User logged in: james C', '2026-07-21 09:10:55'),
(332, 1, 'Logout', 'User logged out: james C', '2026-07-21 09:29:06'),
(333, 1, 'Login', 'User logged in: james C', '2026-07-21 09:31:17'),
(334, 1, 'Logout', 'User logged out: james C', '2026-07-21 09:32:06'),
(335, 9, 'Login', 'User logged in: Dong H', '2026-07-21 09:35:45'),
(336, 9, 'Reset Password First Time', 'User reset password on first login for: Dong.H@gmail.com', '2026-07-21 09:36:08'),
(337, 9, 'Logout', 'User logged out: Dong H', '2026-07-21 09:36:36'),
(338, 1, 'Login', 'User logged in: james C', '2026-07-21 09:36:58'),
(339, 1, 'Logout', 'User logged out: james C', '2026-07-21 10:19:39'),
(340, 1, 'Login', 'User logged in: james C', '2026-07-21 10:19:47'),
(343, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-07-22 01:40:14'),
(344, 1, 'Reset Password First Time', 'User reset password on first login for: chayanon.1547@gmail.com', '2026-07-22 01:40:23'),
(346, 1, 'Login', 'User logged in: Chayanon C', '2026-07-22 02:00:32'),
(347, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-22 02:00:38'),
(348, 1, 'Reset Password', 'User reset password for: chayanon.1547@gmail.com', '2026-07-22 02:01:28'),
(349, 1, 'Login', 'User logged in: Chayanon C', '2026-07-22 02:02:31'),
(350, 1, 'Soft Delete User', 'Soft deleted user: admin admin (admin@example.com)', '2026-07-22 02:19:59'),
(351, 1, 'Soft Delete User', 'Soft deleted user: Erick h (Erick.h@gmail.com)', '2026-07-22 02:21:40'),
(352, 1, 'Soft Delete User', 'Soft deleted user: Ada Wang (Ada.Wang@gmail.com)', '2026-07-22 02:23:06'),
(353, 1, 'Create New Project', 'Created project: แหห', '2026-07-22 02:23:56'),
(354, 1, 'Create Task Success', 'Created task: ๆฟหหก under project ID: 18', '2026-07-22 02:24:53'),
(355, 1, 'Soft Delete User', 'Soft deleted user: Ada Wang (Ada.Wang@gmail.com)', '2026-07-22 02:27:36'),
(356, 1, 'Suspend User', 'Suspended user: Ada Wang (Ada.Wang@gmail.com)', '2026-07-22 02:44:05'),
(357, 1, 'Activate User', 'Activated user: Ada Wang (Ada.Wang@gmail.com)', '2026-07-22 02:44:13'),
(358, 1, 'Edit Project', 'Edited project ID: 17', '2026-07-22 03:00:06'),
(359, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-22 03:45:21'),
(360, 1, 'Login', 'User logged in: Chayanon C', '2026-07-22 03:45:41'),
(361, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-22 03:45:43'),
(362, 8, 'Login', 'User logged in: King G', '2026-07-22 03:48:41'),
(363, 8, 'Reset Password First Time', 'User reset password on first login for: King.G@gmail.com', '2026-07-22 03:49:03'),
(364, 8, 'Logout', 'User logged out: King G', '2026-07-22 03:49:32'),
(365, 1, 'Login', 'User logged in: Chayanon C', '2026-07-22 03:49:40'),
(366, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-22 04:09:46'),
(368, 1, 'Login', 'User logged in: Chayanon C', '2026-07-22 05:25:03'),
(369, 1, 'Suspend User', 'Suspended user: charlie_t (charlie.t@example.com)', '2026-07-22 06:47:41'),
(370, 1, 'Activate User', 'Activated user: charlie_t (charlie.t@example.com)', '2026-07-22 06:47:44'),
(371, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-23 02:04:38'),
(375, 1, 'Login', 'User logged in: Chayanon C', '2026-07-23 02:37:47'),
(376, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-23 03:17:48'),
(378, 1, 'Login', 'User logged in: Chayanon C', '2026-07-23 03:24:32'),
(379, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-23 04:23:10'),
(380, 1, 'Login', 'User logged in: Chayanon C', '2026-07-23 06:31:59'),
(381, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-23 06:35:38'),
(382, 1, 'Login', 'User logged in: Chayanon C', '2026-07-23 06:35:56'),
(383, 1, 'Create New Project', 'Created project: Groas', '2026-07-23 08:34:01'),
(384, 1, 'Edit Project', 'Edited project ID: 19', '2026-07-23 08:34:11'),
(385, 1, 'Create Task Success', 'Created task: PicoPark under project ID: 19', '2026-07-23 08:35:01'),
(386, 1, 'Update Task Status', 'Updated task \"PicoPark\" status to \"In Progress\"', '2026-07-23 08:35:09'),
(387, 1, 'Update Task Status', 'Updated task \"PicoPark\" status to \"Completed\"', '2026-07-23 08:35:40'),
(388, 1, 'Edit Project', 'Edited project ID: 19', '2026-07-23 08:39:46'),
(389, 1, 'Delete Project', 'Soft deleted project: Groas', '2026-07-23 08:39:55'),
(390, 1, 'Delete Project', 'Soft deleted project: 142', '2026-07-23 08:40:59'),
(391, 1, 'Delete Project', 'Soft deleted project: TestPG_3', '2026-07-23 08:41:30'),
(392, 1, 'Delete Project', 'Soft deleted project: TestPJ', '2026-07-23 08:41:32'),
(393, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-23 08:48:23'),
(394, 5, 'Login', 'User logged in: Dragon G', '2026-07-23 08:49:10'),
(395, 5, 'Reset Password First Time', 'User reset password on first login for: Dragon.G@gmail.com', '2026-07-23 08:49:17'),
(396, 5, 'Logout', 'User logged out: Dragon G', '2026-07-23 08:53:55'),
(397, 1, 'Login', 'User logged in: Chayanon C', '2026-07-23 08:54:07'),
(398, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-23 09:25:22'),
(399, 2, 'Login', 'User logged in: admin admin', '2026-07-23 09:25:31'),
(400, 2, 'Logout', 'User logged out: admin admin', '2026-07-23 09:40:29'),
(401, 1, 'Login', 'User logged in: Chayanon C', '2026-07-23 09:40:36'),
(402, 1, 'Update Task Status', 'Updated task \"แก้งาน\" status to \"Reviewing\"', '2026-07-23 10:15:24'),
(403, 1, 'Update Task Status', 'Updated task \"แก้งาน\" status to \"Completed\"', '2026-07-23 10:15:28'),
(404, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 01:41:23'),
(405, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 01:41:23'),
(406, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 01:41:23'),
(407, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 01:41:23'),
(408, 1, 'Login', 'User logged in: Chayanon C', '2026-07-24 01:41:36'),
(409, 1, 'Create Task Success', 'Created task: ยัง ยัง under project ID: 6', '2026-07-24 02:15:56'),
(410, 1, 'Create Task Success', 'Created task: Got Some One under project ID: 6', '2026-07-24 02:27:12'),
(411, 1, 'Update Task Status', 'Updated task \"Got Some One\" status to \"In Progress\"', '2026-07-24 02:27:28'),
(412, 1, 'Create Task Success', 'Created task: Grid under project ID: 7', '2026-07-24 02:28:17'),
(413, 1, 'Update Task Status', 'Updated task \"Grid\" status to \"In Progress\"', '2026-07-24 02:29:22'),
(414, 1, 'Update Task Details', 'Updated task details for \"แก้งาน\" (ID: 3)', '2026-07-24 03:52:19'),
(415, 1, 'Update Task Details', 'Updated task details for \"ปรับปรุงประสิทธิภาพการคิวรีฐานข้อมูล\" (ID: 18)', '2026-07-24 03:52:34'),
(416, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 04:18:42'),
(417, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 04:18:42'),
(418, 1, 'Login', 'User logged in: Chayanon C', '2026-07-24 05:47:47'),
(419, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 08:25:42'),
(420, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 08:25:42'),
(421, 1, 'Login', 'User logged in: Chayanon C', '2026-07-24 08:45:15'),
(422, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 09:25:42'),
(423, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-24 09:25:42'),
(424, 1, 'Login', 'User logged in: Chayanon C', '2026-07-24 10:15:56'),
(425, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-31 01:50:40'),
(426, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-31 01:50:40'),
(427, 1, 'Login', 'User logged in: Chayanon C', '2026-07-31 02:02:24'),
(428, 1, 'Edit User', 'Edited user ID: 2 (ชยานนท์ จันทพันธ์)', '2026-07-31 02:07:20'),
(429, 1, 'Suspend User', 'Suspended user: ชยานนท์ จันทพันธ์ (admin@example.com)', '2026-07-31 02:32:45'),
(430, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-31 02:42:40'),
(431, 1, 'Logout', 'User logged out: Chayanon C', '2026-07-31 02:42:40'),
(432, 1, 'Login', 'User logged in: Chayanon C', '2026-07-31 03:01:51'),
(433, 1, 'Activate User', 'Activated user: ชยานนท์ จันทพันธ์ (admin@example.com)', '2026-07-31 03:02:49'),
(434, 1, 'Login', 'User logged in: Chayanon C', '2026-07-31 03:03:48'),
(435, 1, 'Import Users', 'Bulk imported: 2 new, updated: 0 existing', '2026-07-31 03:05:44'),
(436, 1, 'Edit User', 'Edited user ID: 2 (Admin Admin)', '2026-07-31 03:06:25'),
(437, 1, 'Edit User', 'Edited user ID: 1 (Chayanon C)', '2026-07-31 03:29:55'),
(438, 1, 'Edit User', 'Edited user ID: 1 (Chayanon Chantapanth)', '2026-07-31 03:31:41'),
(439, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 04:59:05'),
(440, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 04:59:05'),
(441, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 04:59:05'),
(442, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-07-31 04:59:16'),
(443, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 05:38:07'),
(444, 2, 'Login', 'User logged in: Admin Admin', '2026-07-31 05:38:21'),
(445, 2, 'Logout', 'User logged out: Admin Admin', '2026-07-31 05:38:34'),
(446, 6, 'Login', 'User logged in: Snake S', '2026-07-31 05:38:43'),
(447, 6, 'Logout', 'User logged out: Snake S', '2026-07-31 05:47:07'),
(448, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-07-31 05:47:16'),
(449, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 06:15:53'),
(450, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 06:15:53'),
(451, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 06:15:53'),
(452, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-07-31 06:51:58'),
(453, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 07:06:40'),
(454, 1, 'Update Task Details', 'Updated task details for \"PicoPark\" (ID: 5)', '2026-07-31 07:11:57'),
(455, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 07:18:21'),
(456, 6, 'Login', 'User logged in: Snake S', '2026-07-31 07:18:50'),
(457, 6, 'Create Task Success', 'Created task: Translate video under project ID: 6', '2026-07-31 07:19:35'),
(458, 6, 'Create Task Success', 'Created task: cutting video under project ID: 9', '2026-07-31 07:20:37'),
(459, 6, 'Update Task Details', 'Updated task details for \"Translate video\" (ID: 19)', '2026-07-31 07:25:32'),
(460, 6, 'Logout', 'User logged out: Snake S', '2026-07-31 07:30:18'),
(461, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-07-31 07:30:29'),
(462, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 08:10:28'),
(463, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 08:10:28'),
(464, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-07-31 08:12:16'),
(465, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 08:52:40'),
(466, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-07-31 08:52:40'),
(467, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-07-31 08:56:36'),
(468, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 01:45:57'),
(469, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 01:45:57'),
(470, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 01:45:57'),
(471, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 01:45:57'),
(472, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 01:46:06'),
(473, 1, 'Edit Project', 'Edited project ID: 11', '2026-08-03 02:17:53'),
(474, 1, 'Update Task Details', 'Updated task details for \"ใส่ Sub Title\" (ID: 2)', '2026-08-03 02:46:13'),
(475, 1, 'Update Task Details', 'Updated task details for \"Translate video\" (ID: 19)', '2026-08-03 02:46:24'),
(476, 1, 'Update Task Details', 'Updated task details for \"จัดทำวิดีโอแนะนำแอปพลิเคชัน\" (ID: 11)', '2026-08-03 02:46:39'),
(477, 1, 'Update Task Details', 'Updated task details for \"เขียน API สำหรับดึงรายงาน Excel\" (ID: 14)', '2026-08-03 02:46:47'),
(478, 1, 'Update Task Details', 'Updated task details for \"จัดทำวิดีโอแนะนำแอปพลิเคชัน\" (ID: 11)', '2026-08-03 02:47:03'),
(479, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 02:53:05'),
(480, 6, 'Login', 'User logged in: Snake S', '2026-08-03 02:53:13'),
(481, 6, 'Logout', 'User logged out: Snake S', '2026-08-03 03:05:22'),
(482, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 03:05:31'),
(483, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 03:10:37'),
(484, 6, 'Login', 'User logged in: Snake S', '2026-08-03 03:10:57'),
(485, 6, 'Logout', 'User logged out: Snake S', '2026-08-03 03:18:15'),
(486, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 03:18:27'),
(487, 1, 'Edit User', 'Edited user ID: 6 (Snake S)', '2026-08-03 03:23:23'),
(488, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 03:23:27'),
(489, 6, 'Login', 'User logged in: Snake S', '2026-08-03 03:23:37'),
(490, 6, 'Logout', 'User logged out: Snake S', '2026-08-03 03:24:13'),
(491, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 03:24:20'),
(492, 1, 'Edit User', 'Edited user ID: 6 (Snake S)', '2026-08-03 03:24:30'),
(493, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 03:24:41'),
(494, 6, 'Login', 'User logged in: Snake S', '2026-08-03 03:24:47'),
(495, 6, 'Logout', 'User logged out: Snake S', '2026-08-03 03:25:34'),
(496, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 03:25:44'),
(497, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 03:27:31'),
(498, 6, 'Login', 'User logged in: Snake S', '2026-08-03 03:27:39'),
(499, 6, 'Logout', 'User logged out: Snake S', '2026-08-03 03:28:02'),
(500, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 03:28:11'),
(501, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 03:46:32'),
(502, 6, 'Login', 'User logged in: Snake S', '2026-08-03 03:46:47'),
(503, 6, 'Logout', 'User logged out: Snake S', '2026-08-03 03:47:47'),
(504, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 03:47:56'),
(505, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 03:52:54'),
(506, 2, 'Login', 'User logged in: Admin Admin', '2026-08-03 03:53:03'),
(507, 2, 'Logout', 'User logged out: Admin Admin', '2026-08-03 04:05:13'),
(508, 5, 'Login', 'User logged in: Dragon G', '2026-08-03 04:07:25'),
(509, 5, 'Update Task Details', 'Updated task details for \"แก้งานVideo\" (ID: 1)', '2026-08-03 04:08:38'),
(510, 5, 'Logout', 'User logged out: Dragon G', '2026-08-03 04:09:27'),
(511, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 04:09:39'),
(512, 1, 'Create Task Success', 'Assigned task \"แปลเอกสารสัญญาและข้อตกลงบริการ (Service Agreement Translation)\" to Chayanon Chantapanth', '2026-08-03 04:20:44'),
(513, 1, 'Create Task Success', 'Assigned task \"ตัดต่อวิดีโอเปิดตัวโปรเจกต์ใหม่ (New Project Launch Video Editing)\" to Chayanon Chantapanth', '2026-08-03 04:20:44'),
(514, 1, 'Create Task Success', 'Assigned task \"จัดทำซับไตเติลภาษาอังกฤษประกอบวิดีโอ (English Subtitles Generation)\" to Chayanon Chantapanth', '2026-08-03 04:20:44'),
(515, 1, 'Create Task Success', 'Assigned task \"ตรวจสอบคุณภาพบทพากย์และซาวด์รีวิว (Voice Over & Sound Quality Review)\" to Chayanon Chantapanth', '2026-08-03 04:20:44'),
(516, 1, 'Create Task Success', 'Assigned task \"ปรับแต่งโทนสีและเรนเดอร์ไฟล์ Master (Color Grading & Master Render)\" to Chayanon Chantapanth', '2026-08-03 04:20:44'),
(517, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 04:49:39'),
(518, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 04:49:39'),
(519, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-03 08:08:38'),
(520, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 08:48:39'),
(521, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-03 08:48:39'),
(522, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-04 09:04:18'),
(523, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-04 09:44:35'),
(524, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 01:40:20'),
(525, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 02:17:16'),
(526, 6, 'Login', 'User logged in: Snake S', '2026-08-05 02:17:27'),
(527, 6, 'Logout', 'User logged out: Snake S', '2026-08-05 02:17:50'),
(528, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 02:17:57'),
(529, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 02:18:04'),
(530, 5, 'Login', 'User logged in: Dragon G', '2026-08-05 02:18:11'),
(531, 5, 'Logout', 'User logged out: Dragon G', '2026-08-05 02:18:37'),
(532, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 02:20:54'),
(533, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 02:23:54'),
(534, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 02:24:19'),
(535, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 02:29:41'),
(536, 4, 'Login', 'User logged in: Erick h', '2026-08-05 02:29:46'),
(537, 4, 'Reset Password First Time', 'User reset password on first login for: Erick.h@gmail.com', '2026-08-05 02:29:57'),
(538, 4, 'Logout', 'User logged out: Erick h', '2026-08-05 02:30:29'),
(539, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 02:30:36'),
(540, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 03:10:37'),
(541, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 03:10:37'),
(542, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 05:33:10'),
(543, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 06:13:31'),
(544, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 06:13:31'),
(545, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 06:34:30'),
(546, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 07:14:31'),
(547, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 07:14:31'),
(548, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 07:50:13'),
(549, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 08:30:31'),
(550, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 09:19:32'),
(551, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 09:21:30'),
(552, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-05 09:27:31'),
(553, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 10:07:33'),
(554, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-05 10:07:33'),
(555, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 01:46:15'),
(556, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 02:26:26'),
(557, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 02:26:26'),
(558, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 02:43:05'),
(559, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 02:43:26'),
(560, 5, 'Login', 'User logged in: Dragon G', '2026-08-06 02:43:34'),
(561, 5, 'Logout', 'User logged out: Dragon G', '2026-08-06 02:52:40'),
(562, 6, 'Login', 'User logged in: Snake S', '2026-08-06 02:52:50'),
(563, 6, 'Create New Project', 'Created project: Jeed', '2026-08-06 02:58:49'),
(564, 6, 'Create Task Success', 'Created task: Jaad under project ID: 20', '2026-08-06 03:03:02'),
(565, 6, 'Logout', 'User logged out: Snake S', '2026-08-06 03:03:16'),
(566, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 03:03:32'),
(567, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 03:03:48'),
(568, 43, 'Login', 'User logged in: Jin woo Sung', '2026-08-06 03:03:53'),
(569, 43, 'Update Task Details', 'Updated task details for \"Jaad\" (ID: 26)', '2026-08-06 03:06:34'),
(570, 43, 'Logout', 'User logged out: Jin woo Sung', '2026-08-06 03:06:54'),
(571, 43, 'Login', 'User logged in: Jin woo Sung', '2026-08-06 03:07:13'),
(572, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 03:09:28'),
(573, 1, 'Update Task Details', 'Updated task details for \"Jaad\" (ID: 26)', '2026-08-06 03:30:38'),
(574, 43, 'Update Task Details', 'Updated task details for \"Jaad\" (ID: 26)', '2026-08-06 03:31:29'),
(575, 43, 'Logout', 'User logged out: Jin woo Sung', '2026-08-06 03:47:26'),
(576, 43, 'Logout', 'User logged out: Jin woo Sung', '2026-08-06 03:47:26'),
(577, 1, 'Edit Project', 'Edited project ID: 20', '2026-08-06 03:49:46'),
(578, 1, 'Edit Project', 'Edited project ID: 12', '2026-08-06 04:00:00'),
(579, 1, 'Update Task Status', 'Updated task \"ทำ SEO สำหรับหน้าแรก\" status to \"Completed\"', '2026-08-06 04:00:17'),
(580, 1, 'Edit Project', 'Edited project ID: 16', '2026-08-06 04:00:35'),
(581, 1, 'Update Task Status', 'Updated task \"จัดทำวิดีโอแนะนำแอปพลิเคชัน\" status to \"Completed\"', '2026-08-06 04:05:03'),
(582, 1, 'Create Task Success', 'Created task: Cloud Attack under project ID: 10', '2026-08-06 04:05:56'),
(583, 1, 'Update Task Status', 'Updated task \"Cloud Attack\" status to \"In Progress\"', '2026-08-06 04:07:58'),
(584, 1, 'Update Task Details', 'Updated task details for \"ตรวจสอบคุณภาพบทพากย์และซาวด์รีวิว (Voice Over & Sound Quality Review)\" (ID: 24)', '2026-08-06 04:10:54'),
(585, 1, 'Update Task Details', 'Updated task details for \"จัดทำซับไตเติลภาษาอังกฤษประกอบวิดีโอ (English Subtitles Generation)\" (ID: 23)', '2026-08-06 04:10:59'),
(586, 1, 'Update Task Details', 'Updated task details for \"แปลเอกสารสัญญาและข้อตกลงบริการ (Service Agreement Translation)\" (ID: 21)', '2026-08-06 04:11:15'),
(587, 1, 'Update Task Details', 'Updated task details for \"ตัดต่อวิดีโอเปิดตัวโปรเจกต์ใหม่ (New Project Launch Video Editing)\" (ID: 22)', '2026-08-06 04:11:21'),
(588, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 04:21:58'),
(589, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 05:02:26'),
(590, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 05:55:37'),
(591, 1, 'Edit Project', 'Edited project ID: 6', '2026-08-06 06:09:22'),
(592, 1, 'Update Task Status', 'Updated task \"Cloud Attack\" status to \"Completed\"', '2026-08-06 06:10:55'),
(593, 1, 'Update Task Status', 'Updated task \"แก้ไขบั๊กหน้าประวัติการใช้งาน\" status to \"Reviewing\"', '2026-08-06 06:12:20'),
(594, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 06:51:07'),
(595, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 07:15:26'),
(596, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 07:15:26'),
(597, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 07:25:57'),
(598, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 07:31:26'),
(599, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 08:06:26'),
(600, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 09:49:32'),
(601, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 09:50:13'),
(602, 1, 'Login', 'User logged in: Chayanon Chantapanth', '2026-08-06 09:50:20'),
(603, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 10:30:26'),
(604, 1, 'Logout', 'User logged out: Chayanon Chantapanth', '2026-08-06 10:30:26');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `project_id`, `task_id`, `user_id`, `comment`, `created_at`) VALUES
(1, NULL, 3, 1, 'Wow', '2026-07-24 03:16:00'),
(2, NULL, 3, 1, 'OMG', '2026-07-24 03:39:09'),
(3, NULL, 5, 1, 'แก้เสร็จแล้ว', '2026-07-31 08:58:45'),
(4, NULL, 1, 5, 'เสร็จแล้วครับฝากตรวจให้อีกรอบครับ', '2026-08-03 04:08:31');

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `filepath` varchar(500) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `task_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `filename`, `filepath`, `file_type`, `file_size`, `project_id`, `uploaded_by`, `created_at`, `task_id`) VALUES
(1, 'solo mewing ð£ï¸ð¥ð¤.jpg', '/uploads/taskfile-1784862937908-47583086.jpg', NULL, NULL, NULL, 1, '2026-07-24 03:15:37', 3);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `read_status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `read_status`, `created_at`) VALUES
(1, 5, 'คุณได้รับมอบหมายงานใหม่: \"แก้งานVideo\" ในโปรเจกต์ \"Wow\"', 0, '2026-07-20 03:10:27'),
(2, 43, 'คุณได้รับมอบหมายงานใหม่: \"ใส่ Sub Title\" ในโปรเจกต์ \"Wow\"', 0, '2026-07-20 03:26:13'),
(3, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Completed\"', 0, '2026-07-20 03:34:53'),
(4, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Completed\"', 0, '2026-07-20 03:34:57'),
(5, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"In Progress\"', 0, '2026-07-20 03:37:05'),
(6, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"In Progress\"', 0, '2026-07-20 03:38:32'),
(7, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"In Progress\"', 0, '2026-07-20 03:39:11'),
(8, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"In Progress\"', 0, '2026-07-20 03:39:52'),
(9, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Reviewing\"', 0, '2026-07-20 03:44:08'),
(10, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Completed\"', 0, '2026-07-20 03:44:12'),
(11, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Completed\"', 0, '2026-07-20 03:45:08'),
(12, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Reviewing\"', 0, '2026-07-20 03:47:42'),
(13, 3, 'งาน \"แก้งานVideo\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Completed\"', 0, '2026-07-20 03:47:46'),
(14, 3, 'งาน \"ใส่ Sub Title\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Completed\"', 0, '2026-07-20 03:56:55'),
(15, 3, 'งาน \"ใส่ Sub Title\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Reviewing\"', 0, '2026-07-20 03:57:13'),
(16, 33, 'คุณได้รับมอบหมายงานใหม่: \"แก้งาน\" ในโปรเจกต์ \"Cybersecurity\"', 0, '2026-07-20 10:22:49'),
(17, 43, 'คุณได้รับมอบหมายงานใหม่: \"PicoPark\" ในโปรเจกต์ \"Groas\"', 0, '2026-07-23 08:35:01'),
(18, 42, 'คุณได้รับมอบหมายงานใหม่: \"ยัง ยัง\" ในโปรเจกต์ \"E-Commerce Website Redesign\"', 0, '2026-07-24 02:15:56'),
(19, 13, 'คุณได้รับมอบหมายงานใหม่: \"Got Some One\" ในโปรเจกต์ \"E-Commerce Website Redesign\"', 0, '2026-07-24 02:27:12'),
(20, 20, 'คุณได้รับมอบหมายงานใหม่: \"Grid\" ในโปรเจกต์ \"Mobile App Development\"', 0, '2026-07-24 02:28:17'),
(21, 15, 'คุณได้รับมอบหมายงานใหม่: \"แก้งาน\" ในโปรเจกต์ \"Cybersecurity\"', 0, '2026-07-24 03:52:19'),
(22, 19, 'คุณได้รับมอบหมายงานใหม่: \"ปรับปรุงประสิทธิภาพการคิวรีฐานข้อมูล\" ในโปรเจกต์ \"Cybersecurity\"', 0, '2026-07-24 03:52:34'),
(23, 1, 'คุณได้รับมอบหมายงานใหม่: \"PicoPark\" ในโปรเจกต์ \"Groas\"', 0, '2026-07-31 07:11:57'),
(24, 6, 'คุณได้รับมอบหมายงานใหม่: \"Translate video\" ในโปรเจกต์ \"E-Commerce Website Redesign\"', 0, '2026-07-31 07:19:35'),
(25, 6, 'คุณได้รับมอบหมายงานใหม่: \"cutting video\" ในโปรเจกต์ \"HR Portal Migration\"', 0, '2026-07-31 07:20:37'),
(26, 43, 'คุณได้รับมอบหมายงานใหม่: \"Jaad\" ในโปรเจกต์ \"Jeed\"', 0, '2026-08-06 03:03:02'),
(27, 3, 'งาน \"ทำ SEO สำหรับหน้าแรก\" ในโปรเจกต์ \"Wow\" ถูกอัปเดตสถานะเป็น \"Completed\"', 0, '2026-08-06 04:00:17'),
(28, 8, 'คุณได้รับมอบหมายงานใหม่: \"Cloud Attack\" ในโปรเจกต์ \"Cloud Infrastructure Setup\"', 0, '2026-08-06 04:05:56');

-- --------------------------------------------------------

--
-- Table structure for table `otp_requests`
--

CREATE TABLE `otp_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_requests`
--

INSERT INTO `otp_requests` (`id`, `user_id`, `otp_code`, `expires_at`, `is_used`, `created_at`) VALUES
(1, 41, '180976', '2026-07-15 07:42:13', 0, '2026-07-15 07:39:13'),
(2, 41, '930598', '2026-07-15 07:47:42', 0, '2026-07-15 07:44:42'),
(3, 41, '846478', '2026-07-15 07:48:11', 0, '2026-07-15 07:45:11'),
(4, 41, '216765', '2026-07-15 08:02:43', 0, '2026-07-15 07:59:43'),
(5, 41, '565049', '2026-07-15 08:02:05', 1, '2026-07-15 08:01:37'),
(6, 43, '295241', '2026-07-15 08:43:00', 1, '2026-07-15 08:42:39'),
(9, 44, '707524', '2026-07-15 09:11:27', 0, '2026-07-15 09:08:27'),
(10, 44, '754435', '2026-07-15 09:12:55', 0, '2026-07-15 09:09:55'),
(11, 44, '199177', '2026-07-15 09:11:03', 1, '2026-07-15 09:10:33'),
(12, 45, '688309', '2026-07-15 09:19:26', 1, '2026-07-15 09:19:01'),
(13, 48, '681719', '2026-07-15 09:40:10', 1, '2026-07-15 09:39:32'),
(14, 42, '413568', '2026-07-15 09:44:43', 1, '2026-07-15 09:42:38'),
(15, 42, '222491', '2026-07-15 09:46:41', 0, '2026-07-15 09:43:41'),
(16, 48, '213168', '2026-07-15 10:05:24', 1, '2026-07-15 10:04:51'),
(17, 45, '879544', '2026-07-15 10:28:26', 1, '2026-07-15 10:28:05'),
(18, 48, '639359', '2026-07-16 07:26:12', 0, '2026-07-16 07:23:12'),
(19, 48, '358864', '2026-07-16 07:29:37', 0, '2026-07-16 07:26:37'),
(20, 42, '320145', '2026-07-17 03:05:35', 1, '2026-07-17 03:03:57'),
(21, 42, '810749', '2026-07-17 03:38:17', 0, '2026-07-17 03:35:17'),
(22, 42, '663415', '2026-07-17 03:38:52', 1, '2026-07-17 03:38:33'),
(25, 1, '160448', '2026-07-22 02:01:28', 1, '2026-07-22 02:00:44'),
(26, 1, '482173', '2026-08-05 02:23:26', 0, '2026-08-05 02:20:26');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in_progress','review','completed') DEFAULT 'pending',
  `user_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `created_by` int(11) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `status`, `user_id`, `start_date`, `end_date`, `created_at`, `priority`, `created_by`, `deleted_at`) VALUES
(3, 'TestPJ', NULL, 'completed', NULL, NULL, '2026-07-14', '2026-07-13 06:41:54', 'Low', NULL, NULL),
(4, 'TestPG_3', NULL, 'completed', NULL, NULL, '2026-07-15', '2026-07-13 06:42:41', 'High', NULL, NULL),
(5, '142', NULL, 'pending', NULL, NULL, '2026-07-09', '2026-07-13 07:06:00', 'Low', NULL, NULL),
(6, 'E-Commerce Website Redesign', NULL, '', NULL, NULL, '2026-08-22', '2026-07-13 07:52:45', 'High', NULL, NULL),
(7, 'Mobile App Development', NULL, '', NULL, NULL, '2026-10-14', '2026-07-13 07:52:45', 'Medium', NULL, NULL),
(9, 'HR Portal Migration', NULL, '', NULL, NULL, '2026-09-11', '2026-07-13 07:52:45', 'Medium', NULL, NULL),
(10, 'Cloud Infrastructure Setup', NULL, 'completed', NULL, NULL, '2026-11-01', '2026-07-13 07:52:45', 'High', NULL, NULL),
(11, 'Cybersecurity Audit', NULL, 'completed', NULL, NULL, '2026-06-23', '2026-07-13 07:52:45', 'High', NULL, NULL),
(12, 'Marketing Brochure Design', NULL, 'completed', NULL, NULL, '2026-08-04', '2026-07-13 07:52:45', 'Low', NULL, NULL),
(13, 'AI Chatbot Integration', NULL, 'pending', NULL, NULL, '2026-12-20', '2026-07-13 07:52:45', 'Medium', NULL, NULL),
(14, 'Database Backup Automation', NULL, '', NULL, NULL, '2026-07-09', '2026-07-13 07:52:45', 'Medium', NULL, NULL),
(16, 'Wow', NULL, 'completed', NULL, NULL, '2026-07-23', '2026-07-17 08:41:23', 'Medium', 3, NULL),
(17, 'Cybersecurity', NULL, 'completed', NULL, NULL, '2026-08-17', '2026-07-20 04:08:26', 'Medium', NULL, NULL),
(19, 'Groas', NULL, 'completed', NULL, NULL, '2026-07-28', '2026-07-23 08:34:01', 'Low', 1, NULL),
(20, 'Jeed', NULL, 'completed', NULL, NULL, '2026-08-10', '2026-08-06 02:58:48', 'Medium', 6, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_team_leaders`
--

CREATE TABLE `project_team_leaders` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_team_leaders`
--

INSERT INTO `project_team_leaders` (`id`, `project_id`, `user_id`, `assigned_at`) VALUES
(4, 3, 12, '2026-07-13 06:41:54'),
(5, 4, 9, '2026-07-13 06:42:41'),
(6, 5, 9, '2026-07-13 07:06:00'),
(11, 10, 9, '2026-07-13 07:52:45'),
(14, 13, 9, '2026-07-13 07:52:45'),
(18, 7, 9, '2026-07-13 08:02:18'),
(27, 9, 12, '2026-07-14 03:24:30'),
(33, 14, 12, '2026-07-20 03:48:01'),
(39, 17, 42, '2026-07-22 03:00:06'),
(42, 19, 19, '2026-07-23 08:39:46'),
(43, 11, 12, '2026-08-03 02:17:53'),
(45, 20, 41, '2026-08-06 03:49:46'),
(46, 12, 20, '2026-08-06 04:00:00'),
(47, 16, 41, '2026-08-06 04:00:35'),
(49, 6, 12, '2026-08-06 06:09:22');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`, `created_at`) VALUES
(1, 'admin', 'System Administrator with full access', '2026-07-13 03:20:08'),
(2, 'manager', 'Project Manager with access to create/manage own projects', '2026-07-13 03:20:08'),
(3, 'video_editor', 'Video Editor staff member', '2026-07-13 03:20:08'),
(4, 'translator', 'Translator staff member', '2026-07-13 03:20:08'),
(5, 'team_leader', 'Team Leader leading project groups', '2026-07-13 03:20:08'),
(6, 'user', 'Standard user / Team member', '2026-07-13 03:20:08');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Pending','In Progress','Reviewing','Completed') DEFAULT 'Pending',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `project_id` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `task_type` varchar(50) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `priority`, `project_id`, `assigned_to`, `due_date`, `created_at`, `task_type`, `deleted_at`) VALUES
(1, 'แก้งานVideo', 'แก้ Video นาทีที่ 13.45 ให้หน่อย', 'Completed', 'medium', 16, 5, '2026-07-21', '2026-07-20 03:10:26', 'ตัดต่อ', NULL),
(2, 'ใส่ Sub Title', 'ใส่ Sub ให้หน่อยใน Video นี้', 'Completed', 'medium', 16, 43, '2026-07-26', '2026-07-20 03:26:13', 'แปล', NULL),
(3, 'แก้งาน', 'แก้บางอย่าง', 'Completed', 'high', 17, 15, '2026-07-16', '2026-07-20 10:22:49', 'งานSomeThing', NULL),
(5, 'PicoPark', 'asdasd', 'Completed', 'medium', 19, 1, '2026-07-26', '2026-07-23 08:35:01', 'ตัดต่อ', NULL),
(6, 'ยัง ยัง', 'melt coco so good', 'Pending', 'medium', 6, 42, '2026-07-24', '2026-07-24 02:15:56', 'แปล', NULL),
(7, 'Got Some One', '123', 'In Progress', 'low', 6, 13, '2026-07-27', '2026-07-24 02:27:12', 'ตัดต่อ', NULL),
(8, 'Grid', '123', 'In Progress', 'high', 7, 20, '2026-07-27', '2026-07-24 02:28:17', 'Grid', NULL),
(9, 'พัฒนาระบบจ่ายเงิน (Payment Gateway)', 'พัฒนาหน้าเชื่อมต่อและหลังบ้านสำหรับชำระเงินผ่านบัตรเครดิต', 'In Progress', 'high', 7, 20, '2026-08-05', '2026-07-24 02:34:38', 'แปล', NULL),
(10, 'แก้ไขบั๊กหน้าประวัติการใช้งาน', 'แก้ไขการเรียงลำดับประวัติกิจกรรมให้ถูกต้อง', 'Reviewing', 'medium', 14, 39, '2026-08-06', '2026-07-24 02:34:38', 'ตัดต่อ', NULL),
(11, 'จัดทำวิดีโอแนะนำแอปพลิเคชัน', 'สร้างและตัดต่อวิดีโอแนะนำการใช้งานเบื้องต้น 3 นาที', 'Completed', 'high', 9, 32, '2026-07-29', '2026-07-24 02:34:38', 'ตัดต่อ', NULL),
(12, 'แปลเอกสารคู่มือภาษาอังกฤษ', 'แปลคู่มือผู้ใช้ระบบจากไทยเป็นอังกฤษ', 'Completed', 'low', 7, 21, '2026-07-31', '2026-07-24 02:34:38', 'แปล', NULL),
(13, 'ทำ SEO สำหรับหน้าแรก', 'ปรับแต่ง Meta Tag, Title และ Content สำหรับหน้าแรก', 'Completed', 'medium', 16, 20, '2026-08-06', '2026-07-24 02:34:38', 'อื่นๆ', NULL),
(14, 'เขียน API สำหรับดึงรายงาน Excel', 'สร้าง endpoint สำหรับ export ตารางออกมาเป็น xlsx', 'Completed', 'medium', 12, 26, '2026-08-04', '2026-07-24 02:34:38', 'แปล', NULL),
(15, 'ออกแบบ UX/UX สำหรับระบบแจ้งเตือน', 'ทำ wireframe และดีไซน์หน้าต่าง notification modal', 'Pending', 'low', 9, 9, '2026-07-26', '2026-07-24 02:34:38', 'อื่นๆ', NULL),
(16, 'อัปโหลดสื่อโฆษณาขึ้น Social Media', 'จัดทำและอัปโหลดแบนเนอร์ประชาสัมพันธ์โครงการ', 'Completed', 'medium', 11, 41, '2026-08-08', '2026-07-24 02:34:38', 'ตัดต่อ', NULL),
(17, 'ทดสอบระบบ Security (Penetration Test)', 'สแกนหาช่องโหว่การโจมตี SQL Injection และ XSS', 'Pending', 'high', 6, 13, '2026-08-05', '2026-07-24 02:34:38', 'อื่นๆ', NULL),
(18, 'ปรับปรุงประสิทธิภาพการคิวรีฐานข้อมูล', 'สร้าง Index เพิ่มเติมบนตารางที่มีการค้นหาบ่อย', 'Completed', 'high', 17, 19, '2026-07-29', '2026-07-24 02:34:38', 'อื่นๆ', NULL),
(19, 'Translate video', NULL, 'Completed', 'medium', 6, 6, '2026-08-03', '2026-07-31 07:19:34', 'แปล', NULL),
(20, 'cutting video', NULL, 'Pending', 'high', 9, 6, '2026-08-04', '2026-07-31 07:20:37', 'ตัดต่อ', NULL),
(21, 'แปลเอกสารสัญญาและข้อตกลงบริการ (Service Agreement Translation)', 'แปลเอกสารสัญญาฉบับสมบูรณ์ภาษาไทยเป็นภาษาอังกฤษพร้อมตรวจสอบความถูกต้องของกฎหมาย', 'Completed', 'high', 3, 1, '2026-08-05', '2026-08-03 04:20:44', 'Translate', NULL),
(22, 'ตัดต่อวิดีโอเปิดตัวโปรเจกต์ใหม่ (New Project Launch Video Editing)', 'ตัดต่อคลิปวิดีโอความยาว 3 นาทีพร้อมใส่ Intro, Sound FX และเอฟเฟกต์การเปลี่ยนฉาก', 'Completed', 'high', 3, 1, '2026-08-04', '2026-08-03 04:20:44', 'Video Edit', NULL),
(23, 'จัดทำซับไตเติลภาษาอังกฤษประกอบวิดีโอ (English Subtitles Generation)', 'แปลคำบรรยายใต้ภาพและทำ Timing Synchronize ให้ตรงกับเสียงพูดในวิดีโอ', 'Completed', 'high', 4, 1, '2026-08-01', '2026-08-03 04:20:44', 'Translate', NULL),
(24, 'ตรวจสอบคุณภาพบทพากย์และซาวด์รีวิว (Voice Over & Sound Quality Review)', 'รีวิวคลิปวิดีโอและไฟล์เสียงสุดท้ายก่อนส่งมอบงานให้ลูกค้า', 'Completed', 'medium', 4, 1, '2026-08-07', '2026-08-03 04:20:44', 'Others', NULL),
(25, 'ปรับแต่งโทนสีและเรนเดอร์ไฟล์ Master (Color Grading & Master Render)', 'ปรับแต่งโทนสีวิดีโอแบบ Cinematic Color Grading และเรนเดอร์ไฟล์ 4K Master', 'Completed', 'medium', 3, 1, '2026-07-29', '2026-08-03 04:20:44', 'Video Edit', NULL),
(26, 'Jaad', 'งง', 'Completed', 'high', 20, 43, '2026-08-07', '2026-08-06 03:03:02', 'งง', NULL),
(27, 'Cloud Attack', NULL, 'Completed', 'high', 10, 8, '2026-08-14', '2026-08-06 04:05:56', 'Attack', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_history`
--

CREATE TABLE `task_history` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_history`
--

INSERT INTO `task_history` (`id`, `task_id`, `action`, `details`, `changed_by`, `changed_at`) VALUES
(1, 3, 'status_change', 'เปลี่ยนสถานะเป็น \"In Progress\"', 1, '2026-07-24 02:58:07'),
(2, 3, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-07-24 02:58:07'),
(3, 3, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-07-24 03:16:09'),
(4, 3, 'status_change', 'เปลี่ยนสถานะเป็น \"Reviewing\"', 1, '2026-07-24 03:16:14'),
(5, 3, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-07-24 03:16:14'),
(6, 3, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-07-24 03:16:19'),
(7, 3, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-07-24 03:16:19'),
(8, 3, 'assignee_change', 'เปลี่ยนผู้รับผิดชอบจาก \"mia_t\" เป็น \"Pstar F\"', 1, '2026-07-24 03:52:19'),
(9, 3, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-07-24 03:52:19'),
(10, 18, 'assignee_change', 'เปลี่ยนผู้รับผิดชอบจาก \"charlie_t\" เป็น \"Domino F\"', 1, '2026-07-24 03:52:34'),
(11, 18, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-07-24 03:52:34'),
(12, 5, 'assignee_change', 'เปลี่ยนผู้รับผิดชอบจาก \"Jin woo Sung\" เป็น \"Chayanon Chantapanth\"', 1, '2026-07-31 07:11:57'),
(13, 5, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-07-31 07:11:57'),
(14, 19, 'create', 'สร้างงาน: \"Translate video\"', 6, '2026-07-31 07:19:35'),
(15, 20, 'create', 'สร้างงาน: \"cutting video\"', 6, '2026-07-31 07:20:37'),
(16, 19, 'status_change', 'เปลี่ยนสถานะเป็น \"In Progress\"', 6, '2026-07-31 07:22:28'),
(17, 19, 'edit_details', 'แก้ไขรายละเอียดงาน', 6, '2026-07-31 07:22:28'),
(18, 19, 'status_change', 'เปลี่ยนสถานะเป็น \"Reviewing\"', 6, '2026-07-31 07:25:31'),
(19, 19, 'edit_details', 'แก้ไขรายละเอียดงาน', 6, '2026-07-31 07:25:32'),
(20, 2, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-03 02:46:13'),
(21, 2, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-03 02:46:13'),
(22, 19, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-03 02:46:24'),
(23, 19, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-03 02:46:24'),
(24, 11, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-03 02:46:39'),
(25, 11, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-03 02:46:39'),
(26, 14, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-03 02:46:47'),
(27, 14, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-03 02:46:47'),
(28, 11, 'status_change', 'เปลี่ยนสถานะเป็น \"Reviewing\"', 1, '2026-08-03 02:47:03'),
(29, 11, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-03 02:47:03'),
(30, 1, 'edit_details', 'แก้ไขรายละเอียดงาน', 5, '2026-08-03 04:08:38'),
(31, 21, 'Created Task', 'Created task assigned to Chayanon Chantapanth', 1, '2026-08-03 04:20:44'),
(32, 22, 'Created Task', 'Created task assigned to Chayanon Chantapanth', 1, '2026-08-03 04:20:44'),
(33, 23, 'Created Task', 'Created task assigned to Chayanon Chantapanth', 1, '2026-08-03 04:20:44'),
(34, 24, 'Created Task', 'Created task assigned to Chayanon Chantapanth', 1, '2026-08-03 04:20:44'),
(35, 25, 'Created Task', 'Created task assigned to Chayanon Chantapanth', 1, '2026-08-03 04:20:44'),
(36, 26, 'create', 'สร้างงาน: \"Jaad\"', 6, '2026-08-06 03:03:02'),
(37, 26, 'status_change', 'เปลี่ยนสถานะเป็น \"In Progress\"', 43, '2026-08-06 03:04:30'),
(38, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 43, '2026-08-06 03:04:30'),
(39, 26, 'status_change', 'เปลี่ยนสถานะเป็น \"Pending\"', 43, '2026-08-06 03:06:34'),
(40, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 43, '2026-08-06 03:06:34'),
(41, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:16:28'),
(42, 26, 'status_change', 'เปลี่ยนสถานะเป็น \"In Progress\"', 43, '2026-08-06 03:16:51'),
(43, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 43, '2026-08-06 03:16:51'),
(44, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:20:40'),
(45, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:20:50'),
(46, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:27:01'),
(47, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:27:12'),
(48, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:28:58'),
(49, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:29:10'),
(50, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:30:32'),
(51, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 03:30:38'),
(52, 26, 'status_change', 'เปลี่ยนสถานะเป็น \"Reviewing\"', 43, '2026-08-06 03:31:21'),
(53, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 43, '2026-08-06 03:31:21'),
(54, 26, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 43, '2026-08-06 03:31:29'),
(55, 26, 'edit_details', 'แก้ไขรายละเอียดงาน', 43, '2026-08-06 03:31:29'),
(56, 13, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-06 04:00:17'),
(57, 11, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-06 04:05:03'),
(58, 27, 'create', 'สร้างงาน: \"Cloud Attack\"', 1, '2026-08-06 04:05:56'),
(59, 27, 'status_change', 'เปลี่ยนสถานะเป็น \"In Progress\"', 1, '2026-08-06 04:07:58'),
(60, 24, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-06 04:10:54'),
(61, 24, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 04:10:54'),
(62, 23, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-06 04:10:59'),
(63, 23, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 04:10:59'),
(64, 21, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-06 04:11:15'),
(65, 21, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 04:11:15'),
(66, 22, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-06 04:11:21'),
(67, 22, 'edit_details', 'แก้ไขรายละเอียดงาน', 1, '2026-08-06 04:11:21'),
(68, 27, 'status_change', 'เปลี่ยนสถานะเป็น \"Completed\"', 1, '2026-08-06 06:10:55'),
(69, 10, 'status_change', 'เปลี่ยนสถานะเป็น \"Reviewing\"', 1, '2026-08-06 06:12:20');

-- --------------------------------------------------------

--
-- Table structure for table `task_status_history`
--

CREATE TABLE `task_status_history` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_status_history`
--

INSERT INTO `task_status_history` (`id`, `task_id`, `status`, `changed_by`, `changed_at`) VALUES
(1, 3, 'Reviewing', 1, '2026-07-24 03:16:14'),
(2, 3, 'Completed', 1, '2026-07-24 03:16:19'),
(3, 19, 'In Progress', 6, '2026-07-31 07:22:28'),
(4, 19, 'Reviewing', 6, '2026-07-31 07:25:32'),
(5, 2, 'Completed', 1, '2026-08-03 02:46:13'),
(6, 19, 'Completed', 1, '2026-08-03 02:46:24'),
(7, 11, 'Completed', 1, '2026-08-03 02:46:39'),
(8, 14, 'Completed', 1, '2026-08-03 02:46:47'),
(9, 11, 'Reviewing', 1, '2026-08-03 02:47:03'),
(10, 26, 'In Progress', 43, '2026-08-06 03:04:30'),
(11, 26, 'Pending', 43, '2026-08-06 03:06:34'),
(12, 26, 'In Progress', 43, '2026-08-06 03:16:51'),
(13, 26, 'Reviewing', 43, '2026-08-06 03:31:21'),
(14, 26, 'Completed', 43, '2026-08-06 03:31:29'),
(15, 13, 'Completed', 1, '2026-08-06 04:00:17'),
(16, 11, 'Completed', 1, '2026-08-06 04:05:03'),
(17, 27, 'In Progress', 1, '2026-08-06 04:07:58'),
(18, 24, 'Completed', 1, '2026-08-06 04:10:54'),
(19, 23, 'Completed', 1, '2026-08-06 04:10:59'),
(20, 21, 'Completed', 1, '2026-08-06 04:11:15'),
(21, 22, 'Completed', 1, '2026-08-06 04:11:21'),
(22, 27, 'Completed', 1, '2026-08-06 06:10:55'),
(23, 10, 'Reviewing', 1, '2026-08-06 06:12:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL COMMENT 'เก็บเป็นbcrypt+hash',
  `role` enum('admin','manager','video_editor','translator','team_leader','user') DEFAULT 'user',
  `avatar` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('active','suspended') DEFAULT 'active',
  `role_id` int(11) DEFAULT NULL,
  `is_force_reset` tinyint(1) DEFAULT 1 COMMENT '1 = ไม่เคยเข้า\r\n0 = เคยเข้าแล้ว',
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `phone`, `password`, `role`, `avatar`, `created_at`, `updated_at`, `status`, `role_id`, `is_force_reset`, `deleted_at`) VALUES
(1, 'Chayanon Chantapanth', 'chayanon.1547@gmail.com', '+66649545054', '$2b$10$uYoJLxzv5BvcQErlCCrMgetsaJjyPDYXRkxf8iro6yNUpJF5Uim6.', 'admin', '/uploads/avatar-1784629954360-694841109.jpg', '2026-07-21 10:32:34', '2026-07-31 03:31:05', 'active', NULL, 0, NULL),
(2, 'Admin Admin', 'admin@example.com', NULL, '$2b$10$irkbjAu1qCCAe0FYu4X5xu7c8AmJlLtehNskMtf.fiTWV15XlVLPC', 'admin', '/uploads/avatar-1784000808555-765070631.jpg', '2026-07-09 05:56:32', '2026-07-31 03:06:25', 'active', NULL, 0, NULL),
(3, 'Ada Wang', 'Ada.Wang@gmail.com', NULL, '$2b$10$H9Ttw/d3P2ZbC7eOIfjmPu43O1/UvYfxe2tKfARsCnsxbZBjByiUO', 'manager', NULL, '2026-07-09 05:58:26', '2026-07-22 02:44:13', 'active', NULL, 0, NULL),
(4, 'Erick h', 'Erick.h@gmail.com', NULL, '$2b$10$UeoSTTg7c5bTWfFIrRbaVOO8RCsdkvqrivk.VFP7y5nTupqFFpZAu', 'manager', NULL, '2026-07-09 06:23:21', '2026-08-05 02:29:57', 'active', NULL, 0, NULL),
(5, 'Dragon G', 'Dragon.G@gmail.com', NULL, '$2b$10$MnIZaL7TrZzo7.YEJ8wfbOfI1ieUhw8NxiRphxEyWR2EsQuSKvE6e', 'video_editor', 'http://127.0.0.1:3000/uploads/avatar-1783581496547-484865528.jpg', '2026-07-09 07:18:16', '2026-07-23 08:49:17', 'active', NULL, 0, NULL),
(6, 'Snake S', 'Snake.S@gmail.com', NULL, '$2b$10$mbH/UQPqp.tzdYXTvZeBAOl/U4.E6./UzZULAxamnM.ykuMePQO46', 'team_leader', 'http://127.0.0.1:3000/uploads/avatar-1783581578184-320795137.jpg', '2026-07-09 07:19:38', '2026-08-03 03:24:30', 'active', NULL, 0, NULL),
(7, 'Ling J', 'Ling.J@gmail.com', NULL, '$2b$10$QCso.vti20.WwKkACyxc/eEwsUz.Ui8hZBAZ3vIxM/FhpS4oouswi', 'admin', NULL, '2026-07-09 09:48:08', '2026-07-14 03:26:20', 'active', NULL, 1, NULL),
(8, 'King G', 'King.G@gmail.com', NULL, '$2b$10$R1xoqu.rYRbnZtkl1nSp9ugek74WYh/eF2ORZLvUDOcYajnDPtOta', 'translator', NULL, '2026-07-09 09:48:37', '2026-07-22 03:49:03', 'active', NULL, 0, NULL),
(9, 'Dong H', 'Dong.H@gmail.com', NULL, '$2b$10$AKH1ztk1IadGeiH/8f9tGOCNWcC92ShnC2HmUxl1qlea7CfhLFqNG', 'team_leader', NULL, '2026-07-09 09:49:00', '2026-07-21 09:36:08', 'active', NULL, 0, NULL),
(11, 'Big T', 'Big.T@gmail.com', NULL, '$2b$10$141xLDo6pQC9EyVAzuT4EuYbYn300T.H8bf0dfzV7qlr7HpFxaSf2', 'translator', NULL, '2026-07-09 09:50:30', '2026-07-15 10:16:49', 'active', NULL, 1, NULL),
(12, 'Projes G', 'Projes.G.1547@gmail.com', NULL, '$2b$10$/FfBq9wdko2Tiqnv9py57.JtUCgJGjjBGrjVT7xhV4JT.0qqOnemO', 'team_leader', NULL, '2026-07-13 03:24:24', '2026-07-13 03:24:24', 'active', NULL, 1, NULL),
(13, 'Grias G', 'Grias.C@gmail.com', NULL, '$2b$10$49Kp/JpG3AoPzSBzL4DBxudSIjGCW50ux7iBGOE8CJQMhrUNXAwfW', 'video_editor', NULL, '2026-07-13 03:25:49', '2026-07-13 03:25:49', 'active', NULL, 1, NULL),
(14, 'Ragias V', 'Ragias.V@gmail.com', NULL, '$2b$10$pkvhF/KaZBMA3X9sdFzQ8OvDa6Lj52NfMGt/aud4vuhRG0VOffDoK', 'manager', NULL, '2026-07-13 03:26:26', '2026-07-13 03:26:26', 'active', NULL, 1, NULL),
(15, 'Pstar F', 'Pstar.F@gmail.com', NULL, '$2b$10$Jz4uhwWAWboSd9EODSKmu.DE7P.qUyMrSwbqrIhzAwTfHoJ3Ag1Ay', 'manager', NULL, '2026-07-13 03:27:03', '2026-07-13 03:27:03', 'active', NULL, 1, NULL),
(17, 'France N', 'France.C@gmail.com', NULL, '$2b$10$/z7ATQ.D6WknsICZ0v1gouzXyMoPDpSDTUqLqOUSCtw7QteZEI3Sy', 'admin', NULL, '2026-07-14 02:51:17', '2026-07-14 02:51:17', 'active', NULL, 1, NULL),
(18, 'Demo M', 'Demo.M@gmail.com', NULL, '$2b$10$N4nbihtOBJ1kXNqn4UYtNebpX/geTi9Jri.OtRhFNbX7WkYjM2jJm', 'team_leader', NULL, '2026-07-14 02:51:17', '2026-07-14 02:51:17', 'active', NULL, 1, NULL),
(19, 'Domino F', 'Domino.F@gmail.com', NULL, '$2b$10$sCEgnMMOCp0No2vk/Xn5w.jvh2MCSCS49MqLYZ.VtRvoz/DnoY9BC', 'video_editor', NULL, '2026-07-14 03:04:38', '2026-07-14 03:04:38', 'active', NULL, 1, NULL),
(20, 'Glomer H', 'Glomer.H@gmail.com', NULL, '$2b$10$lKpEvM8d0UqNnJbCnDvXT.nwmMBocbWOuoMhwxLqRhLDA6BaVPVrO', 'team_leader', NULL, '2026-07-14 03:04:38', '2026-07-14 03:04:38', 'active', NULL, 1, NULL),
(21, 'user1', 'user1@example.com', NULL, '$2b$10$yPMfzNzbV2FVr.WNafZ5GeDa18ugkezo9ARM37LTtLnXKXe3I7Quy', 'video_editor', NULL, '2026-07-14 08:45:25', '2026-07-14 08:45:25', 'active', NULL, 1, NULL),
(22, 'admin_bob', 'admin.bob@example.com', NULL, '$2b$10$q/6GH0tjlcu0ITLGYodwQuCKUKsjAsBxsFLM.v.IEnWnrHlmhzKQ6', 'admin', NULL, '2026-07-14 08:45:26', '2026-07-14 08:45:26', 'active', NULL, 1, NULL),
(23, 'charlie_t', 'charlie.t@example.com', NULL, '$2b$10$tpk90JPQ9GkO.Ia7B1JyzeYpPU8tJfLZS82/alVBhI6.LktYbHyba', 'team_leader', NULL, '2026-07-14 08:45:26', '2026-07-22 06:47:44', 'active', NULL, 1, NULL),
(24, 'david_m', 'david.m@example.com', NULL, '$2b$10$LZA/dOkG87knkXVWTMS.ueZk8R5N0azpmsWN7YOIus/EzGyvPj7fa', 'video_editor', NULL, '2026-07-14 08:45:26', '2026-07-14 08:45:26', 'active', NULL, 1, NULL),
(25, 'emma_translator', 'emma.translator@example.com', NULL, '$2b$10$NDgJo0QX0upSwKOLoS/IVeI7O7jrNPk3obFvGoOwuLqT1t0jehZ6W', 'translator', NULL, '2026-07-14 08:45:26', '2026-07-14 08:45:26', 'active', NULL, 1, NULL),
(26, 'frankie_m', 'frankie.m@example.com', NULL, '$2b$10$TgljxZslaDc8TtsXoHzB6uncvjsVcYTVXjoh3CrTmwllu0J6Ma6OK', 'manager', NULL, '2026-07-14 08:45:26', '2026-07-14 08:45:26', 'active', NULL, 1, NULL),
(27, 'gina_v', 'gina.v@example.com', NULL, '$2b$10$/sJ6y9cqSq4eYPdadVkAverRl.JNUnfxfIfI2ClQnYmvUNLkZrOx6', 'video_editor', NULL, '2026-07-14 08:45:26', '2026-07-14 08:45:26', 'active', NULL, 1, NULL),
(28, 'harry_p', 'harry.p@example.com', NULL, '$2b$10$n9BM0TZWxfcUEsdG41Zo.u1JdSMwILMzya/HVAgyRX2npPy0Xikb6', 'team_leader', NULL, '2026-07-14 08:45:26', '2026-07-14 08:45:26', 'active', NULL, 1, NULL),
(29, 'ivy_a', 'ivy.a@example.com', NULL, '$2b$10$Ey5Pv0GGCoGmlEeJlHIa9uLNVNYlXp.ZzblCQTIU4Be88B6iVHh6q', 'admin', NULL, '2026-07-14 08:45:27', '2026-07-14 08:45:27', 'active', NULL, 1, NULL),
(30, 'jack_r', 'jack.r@example.com', NULL, '$2b$10$ZAKP.DF3WpMpOXDzU2aGhOjM8jWV53TDzYIJTRQT4hTGL2ToIwFsG', 'video_editor', NULL, '2026-07-14 08:45:27', '2026-07-14 08:45:27', 'active', NULL, 1, NULL),
(31, 'karen_manager', 'karen.manager@example.com', NULL, '$2b$10$KN3g3UaW9G1H6vcmfb8FGuTGovkWHr4bzY2Qe1FNQD14mFmGPgYiq', 'manager', NULL, '2026-07-14 08:45:27', '2026-07-14 08:45:27', 'active', NULL, 1, NULL),
(32, 'liam_translator', 'liam.translator@example.com', NULL, '$2b$10$o4RuFDceaPTwkKkO3.xvtObfU43qHPMqe..CPwBQsPlw5j0MMm5GO', 'translator', NULL, '2026-07-14 08:45:27', '2026-07-14 08:45:27', 'active', NULL, 1, NULL),
(33, 'mia_t', 'mia.t@example.com', NULL, '$2b$10$NN2gWmM125u9V7zbEfOC8elV2wZ6VXq5zWf2D8AQoHQeL2dYIzWXa', 'team_leader', NULL, '2026-07-14 08:45:27', '2026-07-14 08:45:27', 'active', NULL, 1, NULL),
(36, 'peter_m', 'peter.m@example.com', NULL, '$2b$10$MyUhOZa8X6fpWq5cfxq6t.XA.Lh8qX.JgZhxeveuGHG0rDulU.BbG', 'manager', NULL, '2026-07-14 08:45:28', '2026-07-14 08:45:28', 'active', NULL, 1, NULL),
(38, 'rachel_t', 'rachel.t@example.com', NULL, '$2b$10$iTNzzkpFwVSFTWQ.zhiSrOTq6WkGO146UoiH8IY.iOJSl5/SsEx4O', 'team_leader', NULL, '2026-07-14 08:45:28', '2026-07-14 08:45:28', 'active', NULL, 1, NULL),
(39, 'sam_translator', 'sam.translator@example.com', NULL, '$2b$10$/MfTM7up1JGlWnZ.LmW1lusVm3PWlGnueKutr/ygI5EbtX2eIBnC.', 'translator', NULL, '2026-07-14 08:45:28', '2026-07-15 10:22:48', 'active', NULL, 1, NULL),
(41, 'Umi Asanagi', 'chayanon.chantapanth@g.swu.ac.th', NULL, '$2b$10$EVDVHh06R688my3.3WBcfeDRXoHkajsAKk9rvNhHG0T96LIlLK.gS', 'team_leader', '/uploads/avatar-1784101071731-309644099.jpg', '2026-07-15 07:37:51', '2026-07-17 04:14:59', 'active', NULL, 0, NULL),
(42, 'Satoru Gojo', 'linkzy1547@gmail.com', NULL, '$2b$10$JzhNqnqUmtDeyHfoOScctO9xxEOWVV9ptE4b98Ja0i01aCLzb/oSy', 'translator', '/uploads/avatar-1784103770701-255083730.jpg', '2026-07-15 08:22:50', '2026-07-17 03:38:52', 'active', NULL, 0, NULL),
(43, 'Jin woo Sung', 'chayanon.sent@gmail.com', NULL, '$2b$10$czXBYFrr1iST6b8DDUyhSuJh.GwGlMZbhltmC67B6JvQRTki.bs.G', 'video_editor', '/uploads/avatar-1784104788722-37431174.jpg', '2026-07-15 08:39:48', '2026-07-15 10:20:40', 'active', NULL, 0, NULL),
(44, 'Yoichi Isagi', 'atera1547@gmail.com', NULL, '$2b$10$DYvGR/GGZZZcwllig5hBLOrTfVoSXQUncYn46lJ8hOxNzT.izJndC', 'manager', '/uploads/avatar-1784106257981-659354701.jpg', '2026-07-15 09:04:18', '2026-07-15 09:11:03', 'active', NULL, 0, NULL),
(45, 'Yuji Itadori', 'ausa.c2512@gmail.com', NULL, '$2b$10$rIaWLr9xAGeRXsQOHm9i3.RC8bKUqnpKnorSOIh6V2ujj6IHHpING', 'admin', '/uploads/avatar-1784107052732-380651341.jpg', '2026-07-15 09:17:32', '2026-07-17 04:17:52', 'active', NULL, 0, NULL),
(48, 'Megumin Explosion', 'linksaber.1547@gmail.com', NULL, '$2b$10$cxO/HoSZjHs3ivZq.mnJ8uKL407KALOGcNX8kFQlZXZCyfkdgxrM.', 'admin', '/uploads/avatar-1784108056961-72774973.jpg', '2026-07-15 09:34:17', '2026-07-15 10:05:24', 'active', NULL, 0, NULL),
(52, 'Frigo Bramin', 'Frigo@gmail.com', NULL, '$2b$10$e5/Z4X.vyNAg0/0OH9YEjeDxC31L6Egc6KrcpsLXQaWXpdM.ZiXtu', 'admin', NULL, '2026-07-31 03:05:44', '2026-07-31 03:05:44', 'active', NULL, 1, NULL),
(53, 'Internal Frame', 'Internal@gmail.com', NULL, '$2b$10$NPMvBiu/Xv0sJwj/Iax8AenpbKFuaMMxe6tkg.VXubJ6/oQLlTk1e', 'manager', NULL, '2026-07-31 03:05:44', '2026-07-31 03:05:44', 'active', NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `otp_requests`
--
ALTER TABLE `otp_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_projects_created_by` (`created_by`);

--
-- Indexes for table `project_team_leaders`
--
ALTER TABLE `project_team_leaders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_project_leader` (`project_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `task_history`
--
ALTER TABLE `task_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Indexes for table `task_status_history`
--
ALTER TABLE `task_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`fullname`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_setting` (`user_id`,`setting_key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=605;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `otp_requests`
--
ALTER TABLE `otp_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `project_team_leaders`
--
ALTER TABLE `project_team_leaders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `task_history`
--
ALTER TABLE `task_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `task_status_history`
--
ALTER TABLE `task_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `files_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `otp_requests`
--
ALTER TABLE `otp_requests`
  ADD CONSTRAINT `otp_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `project_team_leaders`
--
ALTER TABLE `project_team_leaders`
  ADD CONSTRAINT `project_team_leaders_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_team_leaders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `task_history`
--
ALTER TABLE `task_history`
  ADD CONSTRAINT `task_history_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `task_status_history`
--
ALTER TABLE `task_status_history`
  ADD CONSTRAINT `task_status_history_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
