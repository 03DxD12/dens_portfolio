<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $patientName = $_POST['patientName'];
    $appointmentType = $_POST['appointmentType'];
    $appointmentDate = $_POST['appointmentDate'];
    $status = 'Pending';

    // Assuming user_id and dentist_id are predefined or retrieved from session/database
    $user_id = 1; // Example user ID
    $dentist_id = 1; // Example dentist ID

    $sql = "INSERT INTO appointments (user_id, dentist_id, appointment_type, appointment_date, status) VALUES ('$user_id', '$dentist_id', '$appointmentType', '$appointmentDate', '$status')";

    if ($conn->query($sql) === TRUE) {
        echo "Appointment booked successfully!";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>
