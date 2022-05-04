import React, {useState, useEffect} from 'react';
import {decode as atob, encode as btoa} from 'base-64'
import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	PermissionsAndroid,
	StyleSheet,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
const App = () => {
	const objFormater = obj => console.log(JSON.stringify(obj, null, 2));
	const [videoUri, setVideoUri] = useState('');
	const [imageUri, setImageUri] = useState('');

	const [videoContent, setVideoContent] = useState('');
	const pickDocument = async () => {
		try {
			console.log('ya entro');
			const result = await DocumentPicker.pick({
				type: 'application/pdf',
			});
			console.log(result);
		} catch (error) {
			console.log(objFormater(error));
		}
	};


    const pickerVideo = async () => {

        let options = {
            title: 'select_video',
            storageOptions: {
                skipBackup: true,
                path: 'mixed',
            },
            mediaType: 'mixed',
            videoQuality: 'medium',
            maxWidth: 720,
            maxHeight: 720,
            quality: 0.8,
        }

		let assets = null;
		try {
			let permissionGranted = false;
			if(Platform.OS === 'android') {
				permissionGranted = await requestExternalWritePermissionAndroid();
			}
			if(Platform.OS === 'ios') permissionGranted = true;

			if(permissionGranted === true) {
				let result = await ImagePicker.launchImageLibrary(options);
				if(result.didCancel === true) {
					return null;
				}
				assets = result.assets;

				if(result.assets[0].uri.includes('image') === false) {
					let decodedUri = assets[0].uri;
					let split = decodedUri.split('/');
					let name = split.pop();
					let unixTime = Math.round(+new Date()/1000);
					let destPath = `${RNFS.TemporaryDirectoryPath}/${name}-${unixTime}`;

					RNFS.exists(destPath).then(async (pathExists) => {
						if(pathExists === false) {
							await RNFS.copyFile(assets[0].uri, destPath);
							assets[0].uri = 'file://'+destPath;
							setVideoUri(assets[0].uri);
						} else {
							alert('intenta de nuevo');
							return null;
						}
					})
					.catch(error => {
						console.log(error);
						return null;
					})

				} else {
					assets[0].uri = result.assets[0].uri;
					setVideoUri(assets[0].uri);
				}
			}
		} catch(error) {
			console.warn(error);
			return null;
		}

        if (assets?.length > 0) {
            return {
                uri:  assets[0].uri,
                type: assets[0].type,
				media: assets[0].uri,
            }
        } else {
			return null;
		}
    }

	const requestExternalWritePermissionAndroid = async () => {
		try {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				{
					title: 'Extenal Storage Write Permission',
					message: 'App needs write permission',
				},
			);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log('now u can use the camera');
				return true;
			} else {
				console.log('Camera permission denied');
				return false;
			}
		} catch (error) {
			console.log(error);
			return false;
		}
	};

	return (
		<SafeAreaView
			style={{
				justifyContent: 'space-around',
			}}>
			<Text>{videoUri}</Text>
			<View>

				<TouchableOpacity
					style={{
						backgroundColor: 'blue',
						flexGrow: 1,
						maxWidth: 300,
						marginRight: 20,
					}}
					onPress={() => pickerVideo()}>
					<View style={{alignItems: 'center'}}>
						<Text style={{color: 'white', fontSize: 24}}>
							Pick ur video
						</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						backgroundColor: 'red',
						flexGrow: 1,
					}}
					onPress={() => pickDocument()}>
					<Text style={{color: 'white', fontSize: 24}}>
						Pick ur document
					</Text>
				</TouchableOpacity>
			</View>
			<View style={{width: '100%', height: 300, backgroundColor: 'blue'}}>
					{videoUri.length > 0 && (
						<Video
							controls={true}
							style={styles.video}
							source={{uri: videoUri }}
						/>
					)}
			</View>
		</SafeAreaView>
	);
};

export default App;

const styles = StyleSheet.create({
	video: {
		width: 300,
		height: 300,
	}
})
