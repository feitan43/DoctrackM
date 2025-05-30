// PODetails.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  GLOBAL_STYLES as styles,
  COLORS,
  SPACING,
  FONT_SIZES,
} from './../styles/theme';
import {insertCommas} from '../utils/insertComma';

export const GeneralInformationCard = ({genInformationData}) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.headerText}>General Information</Text>
    </View>
    {[
      {
        label: 'Classification',
        value: genInformationData?.ComplexLabel,
      },
      {
        label: 'TN',
        value: genInformationData.TrackingNumber,
      },
      {label: 'Claimant', value: genInformationData.Claimant},
      ...(genInformationData.TrackingPartner
        ? [
            {
              label: 'TN Partner',
              value: genInformationData.TrackingPartner,
            },
          ]
        : []),
      ...(genInformationData.BatchTracking
        ? [
            {
              label: 'SLP Tracking',
              value: genInformationData.BatchTracking,
            },
          ]
        : []),
      ...(genInformationData.DocumentType === 'SLP' &&
      genInformationData.ControlNo
        ? [
            {
              label: 'Ctrl Number',
              value: genInformationData.ControlNo,
            },
          ]
        : []),
      ...(genInformationData.ControlNo && genInformationData.ControlNo >= 1
        ? [
            {
              label: 'Ctrl Number',
              value: genInformationData.ControlNo,
            },
          ]
        : []),
      ...(genInformationData.PR_ProgramCode ||
      genInformationData.ADV ||
      genInformationData.OBR_Number
        ? [
            ...(genInformationData.ADV
              ? [{label: 'ADV Number', value: genInformationData.ADV}]
              : []),
            ...(genInformationData.OBR_Number
              ? [
                  {
                    label: 'OBR Number',
                    value: genInformationData.OBR_Number,
                  },
                ]
              : []),
          ]
        : []),

      {label: 'Document', value: genInformationData.DocumentType},
      {label: 'Period', value: genInformationData.PeriodMonth},
      {label: 'Claim Type', value: genInformationData.ClaimType},
      {label: 'Fund', value: genInformationData.Fund},
      ...(genInformationData.DocumentType?.startsWith('WAGES')
        ? []
        : [
            {
              label: 'Check Number',
              value: genInformationData.CheckNumber,
            },
            {
              label: 'Check Date',
              value: genInformationData.CheckDate,
            },
          ]),
      {
        label: 'Net Amount',
        value: insertCommas(genInformationData.NetAmount),
      },
      {label: 'Encoded By', value: genInformationData.EncodedBy},
      {label: 'Date Encoded', value: genInformationData.DateEncoded},
      {label: 'Date Updated', value: genInformationData.DateModified},
    ].map((item, index, arr) => (
      <View key={index} style={styles.listItemContainer}>
        <View style={styles.listItemInner}>
          <Text style={styles.listItemLabel}>
            {/* {item.icon && <Icon name={item.icon} size={FONT_SIZES.medium} color={COLORS.iconColor} />}{' '} */}
            {item.label}
          </Text>
          <Text style={styles.listItemValue}>{item.value || '—'}</Text>
        </View>
        {index !== arr.length - 1 && <View style={styles.divider} />}
      </View>
    ))}
  </View>
);

export const OBRInformationCard = ({
  OBRInformation,
  totalAmount,
  insertCommas,
}) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.headerText}>OBR Information</Text>
    </View>
    <View style={styles.sectionTable}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, {flex: 1}]}>PROGRAM</Text>
        <Text style={[styles.tableHeaderText, {flex: 1, textAlign: 'center'}]}>
          CODE
        </Text>
        <Text style={[styles.tableHeaderTextRight, {flex: 1}]}>AMOUNT</Text>
      </View>
      {OBRInformation && OBRInformation.length > 0 ? (
        OBRInformation.map((item, index, arr) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
              index === arr.length - 1 && styles.tableRowLast,
            ]}>
            <View style={{flex: 1}}>
              <Text
                style={[
                  styles.tableRowMainText,
                  {paddingVertical: SPACING.xs},
                ]}>
                {item.PR_ProgramCode}
              </Text>
              <Text style={styles.tableRowSubText}>{item.ProgramName}</Text>
            </View>
            <View style={{flex: 1, alignItems: 'center'}}>
              <Text
                style={[
                  styles.tableRowMainText,
                  {paddingVertical: SPACING.xs},
                ]}>
                {item.PR_AccountCode}
              </Text>
              <Text style={styles.tableRowSubText}>{item.AccountTitle}</Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Text
                style={[
                  styles.tableRowMainText,
                  {paddingVertical: SPACING.xs},
                ]}>
                {insertCommas(item.Amount)}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No data available</Text>
      )}
      {OBRInformation && OBRInformation.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalAmountText}>
            TOTAL: {insertCommas(totalAmount.toFixed(2))}
          </Text>
        </View>
      )}
    </View>
  </View>
);

export const RemarksCard = ({genInformationData, removeHtmlTags}) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.headerText}>Remarks</Text>
    </View>
    <View style={styles.simpleTextSectionContent}>
      {genInformationData?.Remarks1 ? (
        <Text style={styles.remarksText}>
          {removeHtmlTags(genInformationData.Remarks1)}
        </Text>
      ) : (
        <Text style={styles.noDataText}>No remarks available.</Text>
      )}
    </View>
  </View>
);

export const PendingNoteCard = ({genInformationData}) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.headerText}>Pending Note</Text>
    </View>
    <View style={styles.simpleTextSectionContent}>
      {genInformationData?.Remarks ? (
        <Text style={styles.pendingNoteTextContent}>
          {genInformationData.Remarks}
        </Text>
      ) : (
        <Text style={styles.noDataText}>No pending note provided.</Text>
      )}
    </View>
  </View>
);

export const DigitalCopiesCard = ({
  formTypeMap,
  attachmentsFiles,
  handleAttachFiles,
  handleRemove,
  year,
  trackingNumber,
  handleImagePress,
}) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.headerText}>Digital Copies</Text>
    </View>
    <View style={styles.digitalCopiesContent}>
      {(formTypeMap?.PO || []).length > 0 ? (
        formTypeMap.PO.map((formType, index, arr) => {
          const formTypeFiles =
            attachmentsFiles?.filter(
              fileUrl => fileUrl.split('~')[2] === formType,
            ) || [];
          const hasFiles = formTypeFiles.length > 0;

          return (
            <View
              key={formType}
              style={[
                styles.digitalCopyItem,
                index === arr.length - 1 && styles.digitalCopyItemLast,
              ]}>
              <View style={styles.digitalCopyItemHeader}>
                <Text style={styles.digitalCopyFormType}>
                  {`${index + 1}. ${formType}`}
                </Text>
                <TouchableOpacity
                  disabled={hasFiles}
                  onPress={() => handleAttachFiles(formType)}
                  style={[
                    styles.buttonSmall,
                    styles.attachButton,
                    hasFiles && styles.disabledButton,
                  ]}>
                  <Icon
                    name={'add-circle-outline'}
                    size={FONT_SIZES.large}
                    color={COLORS.white}
                  />
                  <Text
                    style={[
                      styles.buttonSmallText,
                      styles.attachButtonText,
                      {marginLeft: SPACING.xs},
                    ]}>
                    Attach
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!hasFiles}
                  onPress={() => handleRemove(year, trackingNumber, formType)}
                  style={[
                    styles.buttonSmall,
                    styles.removeButton,
                    !hasFiles && styles.disabledButton,
                    {marginRight: 0},
                  ]}>
                  <Icon
                    name={'trash-outline'}
                    size={FONT_SIZES.large}
                    color={COLORS.deleteIconColor}
                  />
                </TouchableOpacity>
              </View>
              <View style={{marginTop: SPACING.xs}}>
                {hasFiles ? (
                  formTypeFiles.map((fileUrl, fileIndex) => {
                    const uniqueUri = `${fileUrl}?timestamp=${Date.now()}`;
                    const fileExtension = fileUrl
                      .split('.')
                      .pop()
                      ?.toLowerCase();
                    const fileName = fileUrl.split('~').slice(-2).join('~');
                    const uniqueKey = `file-${formType}-${fileIndex}-${fileName}`;

                    return (
                      <View key={uniqueKey} style={styles.fileEntry}>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          onPress={() => {
                            if (fileExtension === 'pdf') {
                              Linking.openURL(uniqueUri).catch(err =>
                                console.error('Failed to open PDF', err),
                              );
                            } else {
                              handleImagePress(uniqueUri);
                            }
                          }}>
                          <Icon
                            name={
                              fileExtension === 'pdf'
                                ? 'document-text-outline'
                                : 'image-outline'
                            }
                            size={FONT_SIZES.medium}
                            color={COLORS.primary}
                          />
                          <Text
                            style={styles.fileEntryText}
                            numberOfLines={1}
                            ellipsizeMode="middle">
                            {fileName}
                          </Text>
                          <Icon
                            name={'eye-outline'}
                            size={FONT_SIZES.medium}
                            color={COLORS.iconColor}
                            style={{marginLeft: SPACING.s}}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <Text
                    style={[
                      styles.noDataText,
                      {paddingVertical: SPACING.s, textAlign: 'left'},
                    ]}>
                    No attached files
                  </Text>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <Text style={styles.noDataText}>No form types available for PO.</Text>
      )}
    </View>
  </View>
);

export const TransactionHistoryCard = ({
  transactionHistory,
  removeHtmlTags,
}) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.headerText}>Transaction History</Text>
    </View>
    <View style={styles.transactionListContainer}>
      <View style={styles.transactionListHeader}>
        <View style={{flex: 1}} />
        <View style={{flex: 3}}>
          <Text style={styles.transactionListHeaderText}>DATE</Text>
        </View>
        <View style={{flex: 5}}>
          <Text
            style={[styles.transactionListHeaderText, {textAlign: 'center'}]}>
            STATUS
          </Text>
        </View>
        <View style={{flex: 3, alignItems: 'flex-end'}}>
          <Text style={styles.transactionListHeaderText}>COMPLETION</Text>
        </View>
      </View>
      {transactionHistory && transactionHistory.length > 0 ? (
        transactionHistory.map((item, index, arr) => (
          <View key={index}>
            <View
              style={[
                styles.transactionRow,
                index % 2 === 0
                  ? styles.transactionRowEven
                  : styles.transactionRowOdd,
              ]}>
              <View style={{flex: 1}}>
                <Text style={styles.transactionIndexText}>
                  {/* <Icon name={'ellipse'} size={FONT_SIZES.small} color={COLORS.accent} /> */}{' '}
                  {index + 1}
                </Text>
              </View>
              <View style={{flex: 3}}>
                <Text style={styles.transactionDateText}>
                  {item.DateModified}
                </Text>
              </View>
              <View style={{flex: 5}}>
                <Text style={styles.transactionStatusText}>{item.Status}</Text>
              </View>
              <View style={{flex: 3}}>
                <Text style={styles.transactionCompletionText}>
                  {removeHtmlTags(item.Completion)}
                </Text>
              </View>
            </View>
            {index !== arr.length - 1 && (
              <View
                style={[styles.divider, {marginHorizontal: 0, marginTop: 0}]}
              />
            )}
          </View>
        ))
      ) : (
        <Text style={[styles.noDataText, {marginTop: SPACING.m}]}>
          No Transaction History available
        </Text>
      )}
    </View>
  </View>
);
