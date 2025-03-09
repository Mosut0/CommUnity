import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';

interface Report {
  reportid: number;
  category: string;
  description: string;
  eventtype?: string;
  itemtype?: string;
  hazardtype?: string;
}

const categoryDisplayNames: { [key: string]: string } = {
  All: 'All Reports',
  Event: 'Reported Events',
  Lost: 'Reported Lost Items',
  Found: 'Reported Found Items',
  Safety: 'Reported Hazards',
};

const categoryDatabaseNames: { [key: string]: string } = {
  'All Reports': 'all',
  'Reported Events': 'event',
  'Reported Lost Items': 'lost',
  'Reported Found Items': 'found',
  'Reported Hazards': 'safety',
};

export default function Forums() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [selectedCategory]);

  const fetchReports = async () => {
    let query = supabase.from('reports').select(`
      reportid,
      category,
      description,
      eventtype:events(eventtype),
      lostitemtype:lostitems(itemtype),
      founditemtype:founditems(itemtype),
      hazardtype:hazards(hazardtype)
    `);

    if (selectedCategory !== 'All Reports') {
      query = query.eq('category', categoryDatabaseNames[selectedCategory]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      const formattedData = data.map((report: any) => ({
        reportid: report.reportid,
        category: report.category,
        description: report.description,
        eventtype: formatText(report.eventtype?.[0]?.eventtype || ''),
        itemtype: formatText(report.lostitemtype?.[0]?.itemtype || report.founditemtype?.[0]?.itemtype || ''),
        hazardtype: formatText(report.hazardtype?.[0]?.hazardtype || ''),
      }));
      setReports(formattedData);
    }
  };

  const formatText = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(categoryDisplayNames[category]);
    setIsDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
        <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={isDropdownVisible}
        animationType="slide"
        onRequestClose={toggleDropdown}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleDropdown}>
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('All')}>
              <Text style={styles.dropdownItemText}>All Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Event')}>
              <Text style={styles.dropdownItemText}>Reported Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Lost')}>
              <Text style={styles.dropdownItemText}>Reported Lost Items</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Found')}>
              <Text style={styles.dropdownItemText}>Reported Found Items</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Safety')}>
              <Text style={styles.dropdownItemText}>Reported Hazards</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <ScrollView style={styles.scrollView}>
        {reports.map((report) => (
          <View key={report.reportid} style={styles.reportItem}>
            <Text style={styles.reportTitle}>
              {report.eventtype || report.itemtype || report.hazardtype}
            </Text>
            <Text style={styles.reportCategory}>{report.category}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdownButton: {
    padding: 15,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '80%',
    padding: 10,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    color: '#000',
  },
  scrollView: {
    marginTop: 10,
  },
  reportItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  reportCategory: {
    fontSize: 14,
    color: '#666',
  },
});
