$sg_id = aws ec2 create-security-group --group-name teamforge-backend-sg-new --description "TeamForge Backend Security Group" --query 'GroupId' --output text
aws ec2 authorize-security-group-ingress --group-id $sg_id --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $sg_id --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $sg_id --protocol tcp --port 8000 --cidr 0.0.0.0/0

aws ec2 create-key-pair --key-name teamforge-key-new --query 'KeyMaterial' --output text > teamforge-key-new.pem
icacls teamforge-key-new.pem /inheritance:r
icacls teamforge-key-new.pem /grant:r "$($env:USERNAME):(R)"

$instance_id = aws ec2 run-instances --image-id ami-05a3e9423ae4d7a19 --count 1 --instance-type t2.micro --key-name teamforge-key-new --security-group-ids $sg_id --query 'Instances[0].InstanceId' --output text
Write-Host "Instance ID: $instance_id"

aws ec2 wait instance-running --instance-ids $instance_id
$public_ip = aws ec2 describe-instances --instance-ids $instance_id --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
Write-Host "Public IP: $public_ip"
