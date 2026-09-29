 = aws ec2 create-security-group --group-name teamforge-backend-sg --description "TeamForge Backend Security Group" --query 'GroupId' --output text
aws ec2 authorize-security-group-ingress --group-id  --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 create-key-pair --key-name teamforge-key --query 'KeyMaterial' --output text > teamforge-key.pem
icacls teamforge-key.pem /inheritance:r
icacls teamforge-key.pem /grant:r "dhruv:(R)"

 = aws ec2 run-instances --image-id ami-05a3e9423ae4d7a19 --count 1 --instance-type t2.micro --key-name teamforge-key --security-group-ids  --query 'Instances[0].InstanceId' --output text
Write-Host "Instance ID: "

aws ec2 wait instance-running --instance-ids 
 = aws ec2 describe-instances --instance-ids  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
Write-Host "Public IP: "
