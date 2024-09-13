<?php
	
	session_start();
	
	require_once("../includes/database.php");
	// require_once("../interface/sheets.php");

	
	$dt = time();
	$dateEncoded = date('Y-m-d h:i A', $dt);
	
	$year = substr($dateEncoded,0,4);
	$year = 2021;
	
	$dt = time();
	$today = date('Y-m-d H:i:s', $dt);
	
	// -------------------------------------- GORD - START ------------------------------------------------------ //
	
	
	if(isset($_GET['leomord'])) { //FETCH REGULATORY OFFICE DELAYS

		$office = $database->charEncoder($_GET['office']);

		// $sql = "SELECT * FROM lookup.lookup_table ORDER BY Office, Year";
		// $sql = "SELECT * FROM lookup.lookup_table WHERE OfficeCode = '".$office."' ORDER BY Office, Year";
		$sql = "SELECT * FROM lookup.lookup_table WHERE OfficeCode = '".$office."' ORDER BY DelayedDays desc";
		$record = $database->query($sql);

		$lookup = [];

		while ($data = $database->fetch_array($record)) {

			$year = $data['Year'];
			$trackingNumber = $data['TrackingNumber'];
			$officeCode = $data['Office'];
			$officeName = $data['OfficeName'];
			$docType = $data['DocumentType'];
			$status = $data['DocumentStatus'];
			$dateModified = $data['DateModified'];
			$delayedDays = $data['DelayedDays'];
			$senderOffice = $data['OfficeCode'];
			$senderOfficeName = $data['SenderOffice'];
			$amount = $data['Amount'];
			$email = $data['Email'];

			array_push($lookup, array(
				'Year' => $year,
				'TrackingNumber' => $trackingNumber,
				'Office' => $officeCode,
				'OfficeName' => $officeName,
				'DocumentType' => $docType,
				'DocumentStatus' => $status,
				'DateModified' => $dateModified,
				'DelayedDays' => $delayedDays,
				'OfficeCode' => $senderOffice,
				'SenderOffice' => $senderOfficeName,
				'Amount' => $amount,
				'Email' => $email
			));

		}

		echo json_encode($lookup);
		
	}

	if(isset($_GET['silvana'])) { //FETCH OFFICE DELAYS

		$office = $database->charEncoder($_GET['office']);

		// $sql = "SELECT * FROM lookup.lookup_table ORDER BY Office, Year";
		// $sql = "SELECT * FROM lookup.lookup_table WHERE OfficeCode = '".$office."' ORDER BY Office, Year";
		$sql = "SELECT * FROM lookup.lookup_table2 WHERE Office = '".$office."' ORDER BY DelayedDays desc";
		$record = $database->query($sql);

		$lookup = [];

		while ($data = $database->fetch_array($record)) {

			$year = $data['Year'];
			$trackingNumber = $data['TrackingNumber'];
			$office = $data['Office'];
			$officeName = $data['Name'];
			$docType = $data['DocumentType'];
			$status = $data['Status'];
			$delayedDays = $data['DelayedDays'];
			$email = $data['Email'];

			array_push($lookup, array(
				'Year' => $year,
				'TrackingNumber' => $trackingNumber,
				'Office' => $office,
				'OfficeName' => $officeName,
				'DocumentType' => $docType,
				'DocumentStatus' => $status,
				'DelayedDays' => $delayedDays,
				'Email' => $email
			));

		}

		echo json_encode($lookup);
		
	}

	if (isset($_GET['ark'])) { // LOGIN API

		$user = $database->charEncoder($_GET['user']);
		$pass = $database->charEncoder($_GET['pass']);
		$pushToken = $database->charEncoder($_GET['pushToken']);

		$return = [];

		$sql = "SELECT EmployeeNumber, LastName, FirstName, MiddleName, OfficeCode FROM citydoc.employees WHERE EmployeeNumber = '".$user."' LIMIT 1";
		$record = $database->query($sql);

		
		if($database->num_rows($record) > 0) {
			$data = $database->fetch_array($record);

			$emp = $data['EmployeeNumber'];
			$name = $data['LastName'].', '.$data['FirstName'];
			if(strlen(trim($data['MiddleName'])) > 0) {
				$name .= ' '.$data['MiddleName'][0].'.';
			}
			$empOfis = $data['OfficeCode'];


			$sql = "SELECT Name as OfficeName FROM citydoc.office WHERE Code = '".$empOfis."' LIMIT 1";
			$record = $database->query($sql);
			$data = $database->fetch_array($record);
			$officeName = $data['OfficeName'];


			$sql = "SELECT Id, Password, AccountType, Permission, Privilege FROM citydoc.users WHERE EmployeeNumber = '".$user."' AND Password = '".$pass."' AND RegistrationState = '1' LIMIT 1";
			$record = $database->query($sql);
			$data = $database->fetch_array($record);
			$id = $data['Id'];
			$accType = $data['AccountType'];
			$perm = $data['Permission'];
			$privy = $data['Privilege'];
			
			if($database->num_rows($record) > 0) {
				array_push($return, array(
					'Id' => $id,
					'EmployeeNumber' => $emp,
					'Password' => $pass,
					'OfficeName' => $officeName,
					'FullName' => $name,
					'OfficeCode' => $empOfis,
					'AccountType' => $accType,
					'Permission' => $perm,
					'Privilege' => $privy
				));
			}
			$sql = "UPDATE citydoc.users SET PushToken = '".$pushToken."', MLoginState = 1 WHERE EmployeeNumber = '".$emp."'";
			$database->query($sql);
		}
		echo json_encode($return);
		unset($return);
	}

	if (isset($_GET['sayonara'])) { //LOGOUT API

		$user = $database->charEncoder($_GET['user']);

		$return = [];

		$sql = "SELECT EmployeeNumber FROM citydoc.employees WHERE EmployeeNumber = '".$user."' LIMIT 1";
		$record = $database->query($sql);

		
		if($database->num_rows($record) > 0) {
			$data = $database->fetch_array($record);


			$sql = "SELECT Id, EmployeeNumber, MLoginState FROM citydoc.users WHERE EmployeeNumber = '".$user."' AND RegistrationState = '1' LIMIT 1";
			$record = $database->query($sql);
			$data = $database->fetch_array($record);
			$id = $data['Id'];
			$emp = $data['EmployeeNumber'];
			$mLoginState = $data['MLoginState'];
			
			if($database->num_rows($record) > 0) {
				array_push($return, array(
					'Id' => $id,
					'EmployeeNumber' => $emp,
					'MLoginState' => $mLoginState,
				));
			}
			$sql = "UPDATE citydoc.users SET PushToken = NULL, MLoginState = 0 WHERE EmployeeNumber = '".$emp."'";
			$database->query($sql);
		}
		echo("LOGGED OUT SUCCESSFULLY");
		echo json_encode($return);
		unset($return);
	}

	if (isset($_GET['starfield'])) { //GEN INFO
		$year = $database->charEncoder($_GET['year']);
		$trackingNumber = $database->charEncoder($_GET['tn']);
		$db = $database->getDB($year);

		$sql = "SELECT * FROM ".$db."vouchercurrent WHERE TrackingNumber = '".$trackingNumber."'";
		// if($_SESSION['accountType'] == 1){
		// 	$office = $this->charEncoder($_SESSION['cbo']);
		// 	$sql = "SELECT * FROM vouchercurrent WHERE Office = '".$office."' AND TrackingNumber = '".$trackingNumber."'";
		// }

		$record = $database->query($sql);
		$numRows = $database->num_rows($record);
		$newRecord = [];

		if ($numRows > 0) {
			$grp = '';
			/* $logOffice = $_SESSION['gso'];
			$acct = $_SESSION['accountType'];
			if($_SESSION['accountType'] >= 2){
				$className = 'label19';
			}else{
				$className = 'hide';	
			}
    		*/
			$codes = [];
			$prgCodes = '';
			$accCodes = '';
			$cnt = 0;
			while($data = $database->fetch_array($record)) {
				if($cnt == 0) {
					$newRecord['TrackingNumber'] = $data['TrackingNumber'];
					$newRecord['TrackingType'] = $data['TrackingType'];
					$newRecord['Status'] = $data['Status'];
					$newRecord['Year'] = $data['Year'];



					$newRecord['Office'] = $data['Office'];
					$newRecord['TrackingPartner'] = $data['TrackingPartner'];
					$newRecord['PR_TrackingNumber'] = $data['PR_TrackingNumber'];
					$newRecord['PR_Number'] = $data['PR_Number'];
					$newRecord['PO_Number'] = $data['PO_Number'];
					$newRecord['OBR_Number'] = $data['OBR_Number'];
					$newRecord['PR_Month'] = $data['PR_Month'];

					$newRecord['PR_Sched'] = '';
					if($newRecord['PR_Month'] == 1){
						$newRecord['PR_Sched'] = "1st Quarter";
					}else if($newRecord['PR_Month'] == 4){
						$newRecord['PR_Sched'] = "2nd Quarter";
					}else if($newRecord['PR_Month'] == 7){
						$newRecord['PR_Sched'] = "3rd Quarter";
					}else{
						$newRecord['PR_Sched'] = "4th Quarter";
					}

					$newRecord['ControlNo'] = $data['ControlNo'];
					$newRecord['PeriodType'] = $data['PeriodType'];

					$netAmount = $data['NetAmount'];
					if($data['PeriodType'] == 2){
						$netAmount = $data['Amount'];
					}
					$newRecord['NetAmount'] = $netAmount;

					$newRecord['PayeeNumber'] = $data['PayeeNumber'];
					$newRecord['Fund'] = $data['Fund'];

					$amount = $data['PO_Amount'];
					$total = $data['TotalAmountMultiple'];
					if($data['TrackingType'] == "PO"){
						if($total > 0){
							$poAmount = $total;
						}else{
							$poAmount = $amount;
						}
					}else{
						$amount = $data['Amount'];
						$poAmount = $amount;
					}

					$newRecord['TotalAmountMultiple'] = $total;
					$newRecord['PO_Amount'] = $poAmount;
					$newRecord['Amount'] = $amount;
					$newRecord['Remarks'] = $data['Remarks'];
					$newRecord['Remarks1'] = $data['Remarks1'];
					$newRecord['Claimant'] = $data['Claimant'];
					$newRecord['ClaimType'] = $data['ClaimType'];
					$newRecord['CheckNumber'] = $data['checknumber'];
					$newRecord['CheckDate'] = $data['checkdate'];
					$newRecord['DocumentType'] = $data['DocumentType'];

					$adv =  $data['ADV1'];
					$adv2 =  $data['ADV2'];
				/* 	if($adv < 1  ){
						$adv = '';
						if($acct == '2' ){
							if($newRecord['Status'] == "CBO Released"){
								$adv = '';
							}
							
						}
						if($acct == 4 ){
							$adv = '';
						}
						if($acct == 5 ){
							$adv = 99999;
							if($newRecord['Status'] == "CBO Received" || $newRecord['Status'] == "Encoded"){
									$adv = '0';
							}
						}
						if($acct == 9 ){
							if($newRecord['DocumentType'] == 'LTO COMPUTER FEE'){
								$adv = $data['ADV2'] . 'a' ;
							}
						}	
					} */
					$newRecord['ADV'] = $adv;

					$newRecord['SubCode'] = $data['SubCode'];
					$newRecord['PeaceOfficeId'] = $data['PeaceOfficeId'];
					$newRecord['PeriodType'] = $data['PeriodType'];
					$newRecord['PeriodMonth'] = $data['PeriodMonth'];
					$newRecord['PR_CategoryCode'] = $data['PR_CategoryCode'];
					$newRecord['ChargeType'] = $data['ChargeType'];

					$newRecord['Complex'] = $data['Complex'];
					$newRecord['ComplexLabel'] = 'Simple Transaction';
					if($newRecord['Complex'] == 2) {
						$newRecord['ComplexLabel'] = 'Complex Transaction';
					}

					$newRecord['DateEncoded'] = $data['DateEncoded'];
					$newRecord['DateModified'] = $data['DateModified'];
					$newRecord['Completion'] = $data['Completion'];
					$newRecord['ModeOfProcurement'] = $data['ModeOfProcurement'];
					
					$newRecord['ModeOfProcTitle'] = '';
					if(strlen(trim($newRecord['ModeOfProcurement'])) > 0) {
						$modOfProcList = [	'','Competitive Bidding','Shopping','Shopping 52.1.b','Alternative','Agency to Agency','Negotiated','Negotiated Procurement 53.9(SVP)',
											'Negotiated Procurement 53.1(TFB)','Negotiated Procurement 53.6(MS)','Negotiated Procurement 53.7','Negotiated Procurement 53.2(E.C.)',
											'Postal Office','Direct Contracting','Repeat Order','Two Failed Biddings(TFB)','Extension of Contract Appx. 21 Sec. 3.31',
											'Renewal of Contract Based on Appendix 21 3.3.1.3','Agency to Agency (DBM)','Lease of Real Property Sec 5.10','Direct Retail Purchase Section 53.14'];
						
						$newRecord['ModeOfProcTitle'] = $modOfProcList[$newRecord['ModeOfProcurement']];
					}

					$newRecord['BatchTracking'] = $data['BatchTracking'];
					$newRecord['EmployeeNumber'] = $data['EncodedBy'];
					$newRecord['CategoryName'] = '';
					$newRecord['PR_ProgramCode'] = $data['PR_ProgramCode'];	
					$newRecord['ConformDate'] = $data['ConformDate'];	
					$newRecord['NatureOfPayment'] = $data['NatureOfPayment'];	
					
					$newRecord['PaymentTerm'] = $data['PaymentTerm'];	
					$newRecord['PaymentTermLabel'] = '';	
					if($newRecord['PaymentTerm'] == 1) {
						$newRecord['PaymentTermLabel'] = 'After full delivery';
					}elseif($newRecord['PaymentTerm'] == 2) {
						$newRecord['PaymentTermLabel'] = 'Per Statement';
					}elseif($newRecord['PaymentTerm'] == 3) {
						$newRecord['PaymentTermLabel'] = 'Cash on Delivery';
					}elseif($newRecord['PaymentTerm'] == 4) {
						$newRecord['PaymentTermLabel'] = 'Complete Delivery';
					}

					$newRecord['Specifics'] = $data['Specifics'];
					if($newRecord['Specifics'] == 'Combi') {
						$newRecord['Specifics'] = 'Agricultural products & other Goods/Items';
					}	

					$newRecord['CAOOfficer'] = $data['CAOOfficer'];
					$newRecord['DRRMO'] = $data['ProjectId'];

				}

				$cnt++;

				$prg = $data['PR_ProgramCode'];
				$acc = $data['PR_AccountCode'];
				$amount = $data['PO_Amount'];
				$total = $data['TotalAmountMultiple'];
				if($newRecord['TrackingType'] == "PO"){
					if($total > 0){
						$poAmount = $total;
					}else{
						$poAmount = $amount;
					}
				}else{
					$amount = $data['Amount'];
					$poAmount = $amount;

					if(floatval($total) == 0) {
						$total = $amount;
					}

				}

				if($prg != "") {
					$codes[$prg][$acc] = $prg . '~' . $acc . '~' . $amount . '~' . $total;
					$prgCodes .= ",'".$prg."'";
					$accCodes .= ",'".$acc."'";
				}
			}

			unset($data);


			
			$sql = "SELECT OrderStat,Office as RegOffice FROM " . $db . "status WHERE Type = '" . $newRecord['TrackingType'] . "' AND Status = '" .$newRecord['Status']."' LIMIT 1";
			$record = $database->query($sql);

			if ($database->num_rows($record) > 0) {
				$data = $database->fetch_array($record);
				$newRecord['OrderStat'] = $data['OrderStat'];
				$newRecord['RegOffice'] = $data['RegOffice'];

			} else {
				$newRecord['OrderStat'] = 0;
			}


			$sql = "SELECT * FROM ".$db."office WHERE Code = '".$newRecord['Office']."' LIMIT 1";
			$record = $database->query($sql);
			$data = $database->fetch_array($record);
			$newRecord['OfficeName'] = $data['Name'];

			unset($data);

			$sql = "SELECT LastName, FirstName, MiddleName FROM citydoc.employees WHERE EmployeeNumber = '".$newRecord['EmployeeNumber']."' LIMIT 1";
			$record = $database->query($sql);
			$data = $database->fetch_array($record);
			$newRecord['EncodedBy'] = utf8_encode($data['FirstName'] . ' ' . $data['MiddleName'] . ' ' . $data['LastName']);

			unset($data);

			if(strlen(trim($newRecord['CAOOfficer'])) > 0) {
				$sql = "SELECT * FROM ".$db."inframanpower WHERE EmployeeNumber = '".$newRecord['CAOOfficer']."' LIMIT 1";
				$record = $database->query($sql);
				$data = $database->fetch_array($record);

				$newRecord['CAOOfficerName'] = $data['LastName'].', '.$data['FirstName'].' '.substr($data['MiddleName'], 0, 1).'.';
			}else {
				$newRecord['CAOOfficerName'] = '';
			}


			
			

			if($newRecord['TrackingType'] == "PO"){
				
				// $newRecord['PR_Data'] = urlencode($newRecord['Year'] . '~' . $newRecord['Office'] . '~' . $newRecord['OfficeName'] . '~' . $newRecord['PR_CategoryCode'] .'~' . $newRecord['PR_Month'] . '~' . $newRecord['CategoryName'] . '~' . $newRecord['PR_TrackingNumber']);	
				
				$sql = "SELECT * FROM supplier.supplierinfo WHERE Name = \"". $newRecord['Claimant'] ."\" OR Alias = \"". $newRecord['Claimant'] ."\" LIMIT 1";
				$record = $database->query($sql);
				$data = $database->fetch_array($record);
				$newRecord['SuppClassification'] = $data['Classification'];
				$newRecord['SuppType'] = $data['Type'];
				$newRecord['SuppTIN'] = $data['TIN'];
				$newRecord['SuppCode'] = $data['Code'];
		
				if($newRecord['SuppType'] == 'NV') {
					$newRecord['SuppType'] = "NON-VAT";
				}else {
					$newRecord['SuppType'] = "VAT";
				}

				$sql = "SELECT InvoiceNumber, InvoiceDate, PoDate FROM ".$db."particulars WHERE TrackingNumber = '".$trackingNumber."' LIMIT 1";
				$record = $database->query($sql);
				$data = $database->fetch_array($record);
				$newRecord['InvoiceNumber'] = $data['InvoiceNumber'];
				$newRecord['InvoiceDate'] = $data['InvoiceDate'];
				$newRecord['PoDate'] = $data['PoDate'];

				$newRecord['RetentionTN'] = $newRecord['TrackingPartner'];;


			}elseif($newRecord['TrackingType'] == 'PX'){

				$sql = "SELECT * FROM supplier.supplierinfo WHERE Name = \"". $newRecord['Claimant'] ."\" LIMIT 1";
				$record = $database->query($sql);

				if($database->num_rows($record) > 0) {
					$data = $database->fetch_array($record);
					$newRecord['SuppClassification'] = $data['Classification'];
					$newRecord['SuppType'] = $data['Type'];
					$newRecord['SuppTIN'] = $data['TIN'];
					$newRecord['SuppCode'] = $data['Code'];
				}else {
					$newRecord['SuppClassification'] = "";
					$newRecord['SuppType'] = "";
					$newRecord['SuppTIN'] = "";
					$newRecord['SuppCode'] = "";
				}
		
				if($newRecord['SuppType'] == 'NV') {
					$newRecord['SuppType'] = "NON-VAT";
				}elseif($newRecord['SuppType'] == 'V') {
					$newRecord['SuppType'] = "VAT";
				}
		
				$sql = "SELECT * FROM ".$db."vouchercurrent WHERE TrackingNumber = '".$newRecord['TrackingPartner']."' LIMIT 1";
				$record = $database->query($sql);

				if($database->num_rows($record) > 0) {
					$data = $database->fetch_array($record);
					$newRecord['PO_Nature'] = $data['NatureOfPayment'];
					$newRecord['PO_Specifics'] = $data['Specifics'];
					$newRecord['ModeOfProcurement'] = $data['ModeOfProcurement'];
					$newRecord['PO_PYTerm'] = $data['PaymentTerm'];
					$newRecord['PO_PRTN'] = $data['PR_TrackingNumber'];
				}else {
					$newRecord['PO_Nature'] = '';
					$newRecord['PO_Specifics'] = '';
					$newRecord['ModeOfProcurement'] = '';
					$newRecord['PO_PYTerm'] = '';
					$newRecord['PO_PRTN'] = '';
				}
						
				$newRecord['PaymentTerm'] = $data['PaymentTerm'];	
				$newRecord['PaymentTermLabel'] = '';	
				if($newRecord['PaymentTerm'] == 1) {
					$newRecord['PaymentTermLabel'] = 'After full delivery';
				}elseif($newRecord['PaymentTerm'] == 2) {
					$newRecord['PaymentTermLabel'] = 'Per Statement';
				}elseif($newRecord['PaymentTerm'] == 3) {
					$newRecord['PaymentTermLabel'] = 'Cash on Delivery';
				}elseif($newRecord['PaymentTerm'] == 4) {
					$newRecord['PaymentTermLabel'] = 'Complete Delivery';
				}


				$newRecord['ModeOfProcTitle'] = '';
				if(strlen(trim($newRecord['ModeOfProcurement'])) > 0) {
					$modOfProcList = [	'','Competitive Bidding','Shopping','Shopping 52.1.b','Alternative','Agency to Agency','Negotiated','Negotiated Procurement 53.9(SVP)',
										'Negotiated Procurement 53.1(TFB)','Negotiated Procurement 53.6(MS)','Negotiated Procurement 53.7','Negotiated Procurement 53.2(E.C.)',
										'Postal Office','Direct Contracting','Repeat Order','Two Failed Biddings(TFB)','Extension of Contract Appx. 21 Sec. 3.31',
										'Renewal of Contract Based on Appendix 21 3.3.1.3','Agency to Agency (DBM)','Lease of Real Property Sec 5.10','Direct Retail Purchase Section 53.14'];
					
					$newRecord['ModeOfProcTitle'] = $modOfProcList[$newRecord['ModeOfProcurement']];
				}

				$sql = "SELECT * FROM ".$db."particulars WHERE TrackingNumber = '".$newRecord['TrackingPartner']."' LIMIT 1";
				$record = $database->query($sql);
				$data = $database->fetch_array($record);
				$newRecord['InvoiceNumber'] = $data['InvoiceNumber'];
				$newRecord['InvoiceDate'] = $data['InvoiceDate'];
				$newRecord['PoDate'] = $data['PoDate'];
				$newRecord['GasAccount'] = "";
				$newRecord['GasName'] = "";

				if($newRecord['Office'] == 'ONE1' && $newRecord['PO_Specifics'] == 'Gasoline') { 
					
					$sql = "SELECT * FROM ".$db."particulars WHERE TrackingNumber = '".$newRecord['TrackingNumber']."' LIMIT 1";
					$record = $database->query($sql);
					$data = $database->fetch_array($record);
					$newRecord['InvoiceNumber'] = $data['InvoiceNumber'];
					$newRecord['InvoiceDate'] = $data['InvoiceDate'];
					$newRecord['GasAccount'] = $data['AccountNumber'];

					$sql = "SELECT * FROM ".$db."gasaccounts WHERE AccountNumber = '".$newRecord['GasAccount']."' LIMIT 1";
					$record = $database->query($sql);
					$data = $database->fetch_array($record);
					if($database->num_rows($record) > 0) {
						$newRecord['GasName'] = $data['Office'];
					}else {
						$newRecord['GasName'] = "";
					}

				}

				$sql = "SELECT * FROM ".$db."particulars WHERE TrackingNumber = '".$trackingNumber."' LIMIT 1";
				$record = $database->query($sql);
				$data = $database->fetch_array($record);

				$newRecord['Particulars'] = "";
				if(strlen(trim($data['Particulars'])) > 0) {
					$newRecord['Particulars'] = $data['Particulars'];
				}

				$newRecord['AccountNumber'] = $data['AccountNumber'];

				$newRecord['GasAccountName'] = "";
				if(strlen(trim($newRecord['AccountNumber'])) > 0) {
					$sql = "SELECT * FROM ".$db."gasaccounts WHERE AccountNumber = '".$newRecord['AccountNumber']."' LIMIT 1";
					$record = $database->query($sql);
					$data = $database->fetch_array($record);
					$newRecord['GasAccountName'] = $data['Office'];
				}
				
				$newRecord['RetentionTN'] = "";


				// $newRecord['PR_Data'] = urlencode($newRecord['Year'] . '~' . $newRecord['Office'] . '~' . $newRecord['OfficeName'] . '~' . $newRecord['PR_CategoryCode'] .'~' . $newRecord['PR_Month'] . '~' . $newRecord['CategoryName'] . '~' . $newRecord['TrackingNumber']);
			
			}
			elseif($newRecord['TrackingType'] == 'PY'){

				$docType = $newRecord['DocumentType']; 
				$newRecord['PTRSNo'] = '';
				$newRecord['OfficeAssigned'] = '';

				if(substr($docType, 0, 5) == "WAGES" || (substr($docType, 0, 8)  == "BENEFITS" && $docType != "BENEFITS - ELAP") || substr($docType, 0, 9)  == "ALLOWANCE" || $docType == "ASSISTANCE - FINANCIAL"){
				
					$sql = "SELECT * FROM ".$db."particulars WHERE TrackingNumber = '".$trackingNumber."' LIMIT 1";
					$record = $database->query($sql);
					$data = $database->fetch_array($record);

					$newRecord['PTRSNo'] = $data['PTRSNo'];
					$newRecord['OfficeAssigned'] = $data['OfficeAssigned'];
				}
		
				if($newRecord['DocumentType'] == 'PAYMENT - OTHER OPERATING EXPENSE' || $newRecord['DocumentType'] == 'ALLOWANCE - TRANSPORTATION'){
					$newRecord['OBRType'] = 1;
				}else{
					$sql = "SELECT * FROM ".$db."type WHERE Type = '".$newRecord ['DocumentType']."' LIMIT 1 ";
					$record = $database->query($sql);
					$data = $database->fetch_array($record);
					$newRecord['OBRType'] = $data['OBRType'];
				}
			}else{
				// $newRecord['PR_Data'] = urlencode($newRecord['Year'] . '~' . $newRecord['Office'] . '~' . $newRecord['OfficeName'] . '~' . $newRecord['PR_CategoryCode'] .'~' . $newRecord['PR_Month']. '~' . $newRecord['CategoryName'] . '~' . $newRecord['TrackingNumber']);	
			}
		}

		echo json_encode($newRecord);
		unset($newRecord);
	}

	if (isset($_GET['palworld'])) { //OBR INFO
		$year = $database->charEncoder($_GET['year']);
		$trackingNumber = $database->charEncoder($_GET['tn']);
		$db = $database->getDB($year);
		$return = [];

		$sql = "SELECT a.PR_ProgramCode, b.Name as ProgramName, a.PR_AccountCode, c.Title as AccountTitle, a.Amount, a.PO_Amount, a.TotalAmountMultiple 
				FROM ".$db."vouchercurrent a
				LEFT JOIN ".$db."programcode b ON a.PR_ProgramCode = b.Code
				LEFT JOIN ".$db."fundtitles c ON a.PR_AccountCode = c.Code
				WHERE a.TrackingNumber = '".$trackingNumber."'";
		$record = $database->query($sql);

		if($database->num_rows($record) > 0) {

			while ($data = $database->fetch_array($record)) {
				array_push($return, array(
					'PR_ProgramCode' => $data['PR_ProgramCode'],					
					'ProgramName' => $data['ProgramName'],					
					'PR_AccountCode' => $data['PR_AccountCode'],					
					'AccountTitle' => $data['AccountTitle'],					
					'Amount' => $data['Amount'],					
					'PO_Amount' => $data['PO_Amount'],					
					'TotalAmountMultiple' => $data['TotalAmountMultiple']					
				));
			}

		}

		echo json_encode($return);
		unset($return);

	}

	if (isset($_GET['enshrouded'])) { // PR, PO, PX DETAILS

		$year = $database->charEncoder($_GET['year']);
		$trackingNumber = $database->charEncoder($_GET['tn']);
		$trackingType = $database->charEncoder($_GET['type']);

		$db = $database->getDB($year);
		$dtable = '';
		if ($trackingType == 'PR'){
			$dtable = 'prrecord';
		}elseif($trackingType == 'PO') {
			$dtable = 'porecord';
		}elseif($trackingType == 'PX') {
			$dtable = 'pxrecord';
		}

		// $sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '". str_replace('.','',$db)."' AND TABLE_NAME = '".$dtable."'";

		$sql = "SELECT * FROM ".$db.$dtable." WHERE TrackingNumber = '".$trackingNumber."' ORDER BY ProgramCode, Description";
		$record = $database->query($sql);
		$return = [];

		if($database->num_rows($record) > 0) {
			if ($trackingType == 'PR'){
				while ($data = $database->fetch_array($record)) {
					array_push($return, array(
						'TrackingNumber' => $data['TrackingNumber'],
						'Category' => $data['Category'],
						'ProgramCode' => $data['ProgramCode'],
						'Code' => $data['Code'],
						'Unit' => $data['Unit'],
						'Item' => $data['Item'],
						'Description' => $data['Description'],
						'Qty' => $data['Qty'],
						'Amount' => $data['Amount'],
						'Total' => $data['Total'],
						'Sequence' => $data['Sequence']
					));
				}
			}elseif($trackingType == 'PO') {
				while ($data = $database->fetch_array($record)) {
					array_push($return, array(
						'TrackingNumber' => $data['TrackingNumber'],
						'Category' => $data['Category'],
						'ProgramCode' => $data['ProgramCode'],
						'Code' => $data['Code'],
						'Unit' => $data['Unit'],
						'Item' => $data['Item'],
						'Description' => $data['Description'],
						'Qty' => $data['Qty'],
						'Amount' => $data['Amount'],
						'Total' => $data['Total'],
						'Sequence' => $data['Sequence']
					));
				}
			}elseif($trackingType == 'PX') {
				while ($data = $database->fetch_array($record)) {
					array_push($return, array(
						'TrackingNumber' => $data['TrackingNumber'],
						'Category' => $data['Category'],
						'ProgramCode' => $data['ProgramCode'],
						'Code' => $data['Code'],
						'Unit' => $data['Unit'],
						'Item' => $data['Item'],
						'Description' => $data['Description'],
						'Qty' => $data['Qty'],
						'Amount' => $data['Amount'],
						'Total' => $data['Total'],
						'Days' => $data['Days'],
						'LiquidatedDamages' => $data['LiquidatedDamages'],
						'TotalLD' => $data['TotalLD'],
						'AgriChecked' => $data['AgriChecked']
					));
				}
			}
		}

		echo json_encode($return);
		unset($return);

	}

	if (isset($_GET['riptide'])) { // TRANSACTION HISTORY
		$year = $database->charEncoder($_GET['year']);
		$trackingNumber = $database->charEncoder($_GET['tn']);
		$db = $database->getDB($year);

		$sql = "SELECT * FROM ".$db."voucherhistory WHERE TrackingNumber = '".$trackingNumber."'";
		$record = $database->query($sql);
		$return = [];
		
		if($database->num_rows($record) > 0) {
			while ($data = $database->fetch_array($record)) {
				array_push($return, array(
					'TrackingNumber' => $data['TrackingNumber'],
					'ModifiedBy' => $data['ModifiedBy'],
					'DateModified' => $data['DateModified'],
					'Status' => $data['Status'],
					'Completion' => $data['Completion'],
					'MinutesCounter' => $data['MinutesCounter'],
					'Child' => $data['Child']
				));
			}
		}

		echo json_encode($return);
		unset($return);
	}

	if (isset($_GET['horizon'])) { // PO PAYMENT HISTORY
		$year = $database->charEncoder($_GET['year']);
		$trackingNumber = $database->charEncoder($_GET['tn']);
		$db = $database->getDB($year);

		$sql = "SELECT TrackingNumber, Status FROM ".$db."vouchercurrent WHERE TrackingPartner = '".$trackingNumber."' AND TrackingType = 'PX' GROUP BY TrackingNumber ORDER BY DateEncoded ASC";
		$record = $database->query($sql);
		$numRows = $database->num_rows($record);

		if($numRows > 0) {
			$pxTNList = "";
			$pxVCDetails = [];
			$return = [];
			while ($data = $database->fetch_array($record)) {
				$pxTN = $data['TrackingNumber'];
				$status = $data['Status'];

				$pxTNList .= ",'".$pxTN."'";
				$pxVCDetails[$pxTN] = $status;
			}

			$sql = "SELECT *, SUM(PercentageAmount) as TotalTax FROM ".$db."pxvouchertax where TrackingNumber IN (".substr($pxTNList, 1).") GROUP BY TrackingNumber";
			$record = $database->query($sql);

			while ($data = $database->fetch_array($record)) {
				$pxTN = $data['TrackingNumber'];
				$taxAmount = $data['PercentageAmount'];
				$totalTax = $data['TotalTax'];

				$amount = $data['Amount'];
				$ld = $data['LiquidatedDamages'];
				$gross = $amount + $ld;
				$netAmount = $data['NetAmount'];
				$retention = $data['Retention'];

				$adjType = $data['AdjustmentType'];
				$adjAmount = $data['AdjustmentAmount'];
				$status = $pxVCDetails[$pxTN];

				array_push($return, array(
					'TrackingNumber' => $pxTN,
					'Status' => $status,
					'Gross' => $gross,
					'LiquidatedDamages' => $ld,
					'TotalTax' => $totalTax,
					'Retention' => $retention,
					'AdjustmentType' => $adjType,
					'AdjustmentAmount' => $adjAmount,
					'NetAmount' => $netAmount
				));

			}
		}

		echo json_encode($return);
		unset($pxVCDetails);
		unset($return);
	
	}

	if (isset($_GET['falldown'])) { // PX PAYMENT BREAKDOWN
		$year = $database->charEncoder($_GET['year']);
		$trackingType = $database->charEncoder($_GET['tt']);
		$trackingNumber = $database->charEncoder($_GET['tn']);
		$db = $database->getDB($year);

		$return = []; // Initialize the $return array
	
				$table = strtolower($trackingType).'record';
	
				$sql = "SELECT Unit, Description, Qty, Amount, Total FROM " . $db.$table . " where TrackingNumber = '$trackingNumber'";
				$record = $database->query($sql);


	
				while ($data = $database->fetch_array($record)) {
						$unit = $data['Unit'];
						$description = $data['Description'];
						$qty = $data['Qty'];
						$amount = $data['Amount'];
						$total = $data['Total'];


					array_push($return, array(
					'Unit' => $unit,
					'Description' => $description,
					'Qty' => $qty,
					'Amount' => $amount,
					'Total' => $total,
					));
				
			
				}
		
		echo json_encode($return);
		unset($return);
	}

	if (isset($_GET['fallout'])) { // PX COMPUTATION BREAKDOWN
		$year = $database->charEncoder($_GET['year']);
		$trackingNumber = $database->charEncoder($_GET['tn']);
		$db = $database->getDB($year);

		$sql = "SELECT * FROM supplier.vouchers WHERE Year = '".$year."' AND TrackingNumber = '".$trackingNumber."' ORDER BY Id ASC";
		$record = $database->query($sql);

		if($database->num_rows($record) == 0) {
			$sql = "SELECT * FROM ".$db."pxvouchertax WHERE TrackingNumber = '".$trackingNumber."' ORDER BY Id ASC";
			$record = $database->query($sql);
		}

		$return = [];

		if($database->num_rows($record) > 0) {
			while ($data = $database->fetch_array($record)) {
				$nature = $data['NatureOfPayment'];
				$specifics = $data['Specifics'];
				$gross = $data['Amount'];
				$baseAmount = $data['BaseAmount'];
				$taxPercent = $data['Percentage'];
				$taxAmount = $data['PercentageAmount'];
				$ld = $data['LiquidatedDamages'];
				$net = $data['NetAmount'];
				$adjLabel = $data['AdjustmentLabel'];
				$adjType = $data['AdjustmentType'];
				$adjAmount = $data['AdjustmentAmount'];
	
				$recType = $data['CodeType'];
				if($recType == 'Expanded') {
					$recType = 'EXP';
				}
	
				$retention = $data['Retention'];
	
				$receiptType = $data['ReceiptType'];
	
	
				$int = floor($taxPercent);
				$decimal = $taxPercent - $int;
				if($decimal == 0){
					$taxPercent = intval($data['Percentage']);
				}
				$compBase = number_format( ($gross / 1.12) , 2 );

				array_push($return, array(
					'NatureOfPayment' => $nature,
					'Specifics' => $specifics,
					'Amount' => $gross,
					'BaseAmount' => $compBase,
					'Percentage' => $taxPercent,
					'PercentageAmount' => $taxAmount,
					'LiquidatedDamages' => $ld,
					'NetAmount' => $net,
					'AdjustmentLabel' => $adjLabel,
					'AdjustmentType' => $adjType,
					'AdjustmentAmount' => $adjAmount,
					'CodeType' => $recType,
					'Retention' => $retention,
					'ReceiptType' => $receiptType
				));
			}
		}

		echo json_encode($return);
		unset($return);

	}

	if (isset($_GET['lesley'])) { // MY TRANSACTION
		$year = $database->charEncoder($_GET['year']);
		$employeeNumber = $database->charEncoder($_GET['empnum']);
		$db = $database->getDB($year);
		$return = [];
	
		$latestDateModifiedQuery = "SELECT TrackingNumber, MAX(DateModified) AS MaxDate
									FROM ".$db."vouchercurrent
									GROUP BY TrackingNumber";
	
		$latestDateModifiedResult = $database->query($latestDateModifiedQuery);
	
		$latestDateModifiedMap = [];
	
		while ($row = $database->fetch_array($latestDateModifiedResult)) {
			$latestDateModifiedMap[$row['TrackingNumber']] = $row['MaxDate'];
		}
	
		$sql = "SELECT p.Id, p.TrackingNumber, p.EmployeeNumber, p.EmployeeName, v.Status, v.Claimant, v.DocumentType, v.DateEncoded, v.DateModified, v.PeriodMonth,v.ADV1, v.Fund, v.Amount, v.NetAmount, v.Remarks, v.Year
				FROM ".$db."payrollptrs p, ".$db."vouchercurrent v
				WHERE p.TrackingNumber = v.TrackingNumber
				AND p.EmployeeNumber = '".$employeeNumber."'
				GROUP BY TrackingNumber
				ORDER BY v.DateModified DESC"; 
	
		$record = $database->query($sql);
	
		if ($database->num_rows($record) > 0) {
			while ($data = $database->fetch_array($record)) {
				if ($data['DateModified'] == $latestDateModifiedMap[$data['TrackingNumber']]) {
					array_push($return, array(
						'Id' => $data['Id'],
						'TrackingNumber' => $data['TrackingNumber'],
						'EmployeeNumber' => $data['EmployeeNumber'],
						'ADV1' => $data['ADV1'],
						'Fund' => $data['Fund'],
						'Amount' => $data['Amount'],
						'NetAmount' => $data['NetAmount'],
						'Remarks' => $data['Remarks'],
						'Year' => $data['Year'],
						'EmployeeName' => $data['EmployeeName'],
						'Status' => $data['Status'],
						'Claimant' => $data['Claimant'],
						'DocumentType' => $data['DocumentType'],
						'DateEncoded' => $data['DateEncoded'],
						'DateModified' => $data['DateModified'],
						'PeriodMonth' => $data['PeriodMonth']
					));
				}
			}
		}
	
		echo json_encode($return);
		unset($return);
	}


	if (isset($_GET['snatch'])) { //GET TOKENS FOR REGULATORY
		$return = [];
	
		$sql = "SELECT 
				  a.AccountType, 
				  a.PushToken,
				  a.EmployeeNumber,
				  (SELECT COUNT(*) FROM lookup.lookup_table c WHERE b.OfficeCode = c.OfficeCode) AS TransactionDelay
				FROM 
				  citydoc.users a
				LEFT JOIN 
				  citydoc.employees b ON a.EmployeeNumber = b.EmployeeNumber
				WHERE 
				  b.OfficeCode IN ('8751', '1031', '1081', 'BAAC', '1071', '1061', '1091')
				  AND (a.PushToken IS NOT NULL AND a.PushToken != '')
				  AND a.AccountType >= 2";
	
		$record = $database->query($sql);
	
		if ($database->num_rows($record) > 0) {
			while ($row = $record->fetch_assoc()) {
				$return[] = $row;
			}
			echo json_encode($return);
			unset($return);
		}
	}

	if (isset($_GET['seize'])) { //GET TOKENS NOT REGULATORY
		$officeCode = ['8751', '1031', '1081', 'BAAC', '1071', '1061', '1091'];
		$officeCodeString = "'" . implode("','", $officeCode) . "'";
		$return = [];
	
		$sql = "SELECT 
				  a.AccountType, 
				  a.PushToken,
				  a.EmployeeNumber,
				  (SELECT COUNT(*) FROM lookup.lookup_table2 c WHERE b.OfficeCode = c.Office) AS TransactionDelay
				FROM 
				  citydoc.users a
				LEFT JOIN 
				  citydoc.employees b ON a.EmployeeNumber = b.EmployeeNumber
				WHERE 
				  b.OfficeCode NOT IN (".$officeCodeString.")
				  AND (a.PushToken IS NOT NULL AND a.PushToken != '')";
	
		$record = $database->query($sql);
	
		if ($database->num_rows($record) > 0) {
			while ($row = $record->fetch_assoc()) {
				$return[] = $row;
			}
			echo json_encode($return);
			unset($return);
		}
	}
	
	
	

	// -------------------------------------- GORD - END ------------------------------------------------------ //




?>




















