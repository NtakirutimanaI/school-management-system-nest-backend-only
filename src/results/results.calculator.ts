
export function calculateGrade(marks: number, total: number, passing: number) {
    const percentage = (marks / total) * 100;
    const isPassed = marks >= passing;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else if (percentage >= 40) grade = 'E';
    return { percentage, isPassed, grade };
}
