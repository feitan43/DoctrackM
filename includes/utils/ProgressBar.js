import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const ProgressBar = ({TrackingType, Status, DocumentType, ClaimType, Mode}) => {
  let statusScheme = [];

  //console.log(TrackingType, Status, DocumentType, ClaimType, Mode);

  const parsedMode = parseInt(Mode, 10);

  if (TrackingType === 'PY') {
    if (ClaimType.toUpperCase() === 'CHECK') {
      if (
        DocumentType &&
        DocumentType.toUpperCase() !== 'BOND - RETENTION MONEY'
      ) {
        statusScheme = [
          '1* Encoded',
          '2* Admin Operation Received',
          'x* Pending at Admin Operation',
          'x* Pending Released - Admin Operation',
          '3* CBO Received',
          'x* Pending at CBO',
          'x* Pending Released - CBO',
          '4* CBO Released',
          '5* CAO Received',
          'x* Pending at CAO',
          'x* Pending Released - CAO',
          'x* Fund Correction',
          '6* On Evaluation - Accounting',
          '7* Carded - Accounting',
          '8* SLP Created - Accounting',
          'x* Added to Salary List of Payroll - Accounting',
          '9* Evaluated - Accounting',
          '10* Forwarding Transmittal',
          '11* Check Preparation - CTO',
        ];
        if (Status === 'Forwarded to Admin - Operation') {
          statusScheme.push(
            '12*Forwarded to Admin - Operation',
            '13*Check Advised',
          );
        } else if (Status === 'Forwarded to Admin - Administration') {
          statusScheme.push(
            '12*Forwarded to Admin - Administration',
            '13*Check Advised',
          );
        } else if (Status === 'Forwarded to SP - Admin') {
          statusScheme.push('12*Forwarded to SP - Admin', '13*Check Advised');
        } else {
          statusScheme.push('12*Check for Signature', '13*Check Advised');
        }

        statusScheme.push('14*Check Released');
      } else if (
        DocumentType &&
        DocumentType.toUpperCase() === 'BOND - RETENTION MONEY'
      ) {
        statusScheme = [
          '1* Encoded',
          '2* CAO Received',
          'x* Pending at CAO',
          'x* Pending Released - CAO',
          'x* Fund Correction',
          '3* On Evaluation - Accounting',
          '4* Evaluated - Accounting',
          '5* CAO Released',
        ];
      }
    } else if (ClaimType.toUpperCase() === 'WINDOW') {
      if (DocumentType && DocumentType.toUpperCase().startsWith('WAGES')) {
        statusScheme = [
          '1* Encoded',
          '2* Admin Operation Received',
          'x* Pending at Admin Operation',
          'x* Pending Released - Admin Operation',
          '3* CBO Received',
          'x* Pending at CBO',
          'x* Pending Released - CBO',
          '4* CBO Released',
          '5* CAO Received',
          'x* Pending at CAO',
          'x* Pending Released - CAO',
          'x* Fund Correction',
          '6* Evaluated - Accounting',
          '7* Carded - Accounting',
          '8* CAO Released',
        ];
      } else {
        statusScheme = [
          '1* Encoded',
          '2* CBO Received',
          'x* Pending at CBO',
          'x* Pending Released - CBO',
          '3* CBO Released',
          '4* CAO Received',
          'x* Pending at CAO',
          'x* Pending Released - CAO',
          'x* Fund Correction',
          '5* Carded - Accounting',
          '6* CAO Released',
        ];
      }
    } else {
      statusScheme = [
        '1* Encoded',
        '2* CAO Received',
        'x* Pending at CAO',
        'x* Pending Released - CAO',
        'x* Fund Correction',
        '3* On Evaluation - Accounting',
        '4* Evaluated - Accounting',
        '5* CAO Released',
      ];
    }
  }

  if (TrackingType === 'Purchase Order' || TrackingType === 'PO') {
    statusScheme = [
      '1* Encoded',
      '2* GSO Received',
      'x* Pending at GSO',
      'x* Pending Released - GSO',
      '3* Admin Received',
      'x* Pending at Admin',
      'x* Pending Released - Admin',
      '4* PO Signed',
      '5* Serve to Supplier',
      '6* Supplier Conformed',
      '7* Fund Control',
      'x* Pending at CBO',
      'x* Pending Released - CBO',
      'x* Waiting for Delivery',
      '8* Delivered',
    ];
  }
  if (TrackingType === 'PX' || TrackingType === 'Payment') {
    statusScheme = [
      '1*Encoded',
      '2*For Inspection - GSO',
      '3*Inspection - GSO',
      'x*Pending Inspection - GSO',
      'x*Pending Released - Inspection',
      'x*Inspection On Hold',
      '4*Inspected',
      'x*For Tagging',
      'x*For Correction - Requisitioner',
      'x*Tagged Inventory',
      '5*Voucher Received - - CAO',
      '4*Inventory - GSO',
      'x*Pending Inventory - GSO',
      'x*Pending Released - Inventory',
      '5*Received - CAO',
      'x*Pending at CAO',
      'x*Pending Released - CAO',
      'x*Fund Correction',
      '6*On Evaluation - Accounting',
      '7*Evaluated - Accounting',
      '8*Released - CAO',
      '9*Check Preparation - CTO',
    ];

    if (Status === 'Forwarded to Admin - Operation') {
      statusScheme.push(
        '10*Forwarded to Admin - Operation',
        '11*Check Advised',
      );
    } else if (Status === 'Forwarded to Admin - Administration') {
      statusScheme.push(
        '10*Forwarded to Admin - Administration',
        '11*Check Advised',
      );
    } else if (Status === 'Forwarded to SP - Admin') {
      statusScheme.push('10*Forwarded to SP - Admin', '11*Check Advised');
    } else {
      statusScheme.push('10*Check for Signature', '11*Check Advised');
    }

    statusScheme.push('12*Check Released');
  }

  if (TrackingType === 'PR' || TrackingType === 'Purchase Request') {
    statusScheme = [
      '1* Encoded',
      '2* CBO Received',
      'x* Pending at CBO',
      'x* Pending Released - CBO',
      '3* GSO Received',
      'x* Pending at GSO',
      'x* P.O Signed - GSO',
      'x* Pending Released - GSO',
      '4* GSO Released',
      '5* CTO Received',
      'x* Pending at CTO',
      'x* Pending Released - CTO',
    ];

    if (Status === 'Admin Received') {
      statusScheme.push('6* Admin Received');
    } else if (Status === 'Forwarded to SP Admin - PR') {
      statusScheme.push('6* Forwarded to SP Admin');
    } else {
      statusScheme.push('6* Admin Received'); // Default case if Status doesn't match
    }

    statusScheme.push(
      'x* Pending at Admin',
      'x* Pending Released - Admin',
      '7* Forwarding to BAC',
      '8* BAC Received',
      'x* Pending at BAC',
      'x* Pending Released - BAC',
      '9* BAC Deliberation',
      'x* Pending at Deliberation',
      'x* Pending Released - Deliberation',
    );

    if (parsedMode === 1) {
      statusScheme.push(
        '10* BAC Bidding Process',
        'x* Failed Bid',
        'x* Failed Bid Released',
        '11* BAC Canvas Signed',
        '12* For P.O',
      );
    } else if (parsedMode >= 2 && parsedMode < 15) {
      statusScheme.push(
        '10* BAC Canvassing',
        '11* BAC Canvas Complete',
        '12* Office Review Canvas',
        '13* BAC Received Abstract',
        'x* Pending Abstract',
        'x* Pending Released Draft',
        '14* BAC Awarding',
        '15* BAC For Final Abstract',
        '16* Office Final Abstract',
        '17* BAC Received Final Abstract',
        'x* Pending Final Abstract',
        'x* Pending Released Final Abstract',
        '18* BAC Signed',
        '19* For P.O',
      );
    } else if (parsedMode >= 15) {
      statusScheme.push('10* For P.O');
    }
  }

  let formalOrderStat = 0;
  let maxOrder = 0;

  const nonXStatuses = statusScheme.filter(status => !status.startsWith('x*'));
  const statusIndex = statusScheme.findIndex(status => status.includes(Status));

  if (statusIndex >= 0) {
    const statusInScheme = statusScheme[statusIndex];

    if (statusInScheme.startsWith('x*')) {
      const precedingNonXStatuses = statusScheme
        .slice(0, statusIndex)
        .filter(status => !status.startsWith('x*'));
      formalOrderStat = precedingNonXStatuses.length /* + 1 */;
    } else {
      const statusNumber = parseInt(statusInScheme, 10);
      formalOrderStat = statusNumber;
    }

    maxOrder = nonXStatuses.length;
  }

  // Calculate the progress
  const progress = maxOrder > 0 ? formalOrderStat / maxOrder : 0;
  const progressPercent = Math.round(progress * 100);

  const getColor = () => {
    switch (TrackingType) {
      case 'PY':
      case 'PX':
        return 'rgba(236, 173, 13, 1)';
      case 'PR':
      case 'Purchase Request':
        return 'rgba(36, 165, 6, 1)';
      case 'PO':
      case 'Purchase Order':
        return 'rgba(78, 187, 242, 1)';
      default:
        return 'white'; // Default color
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            {width: `${progressPercent}%`, backgroundColor: getColor()},
          ]}
        />
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {formalOrderStat} / {maxOrder}
        </Text>
        <Text style={styles.percentageLabel}>{progressPercent}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    right: 0,
    top: 5,
  },
  label: {
    fontFamily: 'Oswald-ExtraLight',
    color: 'white',
    marginRight: 10,
    fontSize: 10,
  },
  percentageLabel: {
    fontFamily: 'Oswald-Regular',
    color: 'white',
    fontSize: 12,
  },
});

export default ProgressBar;
