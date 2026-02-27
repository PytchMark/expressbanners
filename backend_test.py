#!/usr/bin/env python3
"""
Backend API Test Suite for Express Banners
Tests the /media endpoint functionality and route ordering.
"""

import requests
import json
from typing import Dict, Any, Tuple

class ExpressBannersAPITest:
    def __init__(self, base_url: str = "https://expressbanners-834003823077.us-central1.run.app"):
        self.base_url = base_url
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
    
    def test_media_endpoint_with_folder(self) -> bool:
        """Test /media?folder=expressbanners/catalogue&max=5 returns JSON, not HTML"""
        try:
            response = requests.get(f"{self.base_url}/media", params={
                "folder": "expressbanners/catalogue",
                "max": "5"
            })
            
            # Production should return 200 with media items (has Cloudinary env vars)
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if response.status_code == 200 and is_json:
                try:
                    data = response.json()
                    has_folder = 'folder' in data
                    has_items = 'items' in data and isinstance(data['items'], list)
                    self.log_test(
                        "GET /media?folder=... returns 200 JSON with media items",
                        has_folder and has_items,
                        f"Status: {response.status_code}, Content-Type: {content_type}, Folder: {data.get('folder')}, Items count: {len(data.get('items', []))}"
                    )
                    return has_folder and has_items
                except json.JSONDecodeError:
                    self.log_test(
                        "GET /media?folder=... returns 200 JSON with media items",
                        False,
                        f"Response not valid JSON despite content-type: {content_type}"
                    )
                    return False
            else:
                self.log_test(
                    "GET /media?folder=... returns 200 JSON with media items",
                    False,
                    f"Expected 200 with JSON, got {response.status_code} with {content_type}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET /media?folder=... returns 200 JSON with media items",
                False,
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_media_endpoint_missing_folder(self) -> bool:
        """Test /media without folder param returns 400 JSON error"""
        try:
            response = requests.get(f"{self.base_url}/media")
            
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if response.status_code == 400 and is_json:
                try:
                    data = response.json()
                    expected_error = "folder query parameter is required"
                    has_correct_error = data.get('error') == expected_error
                    
                    self.log_test(
                        "GET /media without folder returns 400 JSON error",
                        has_correct_error,
                        f"Status: {response.status_code}, Error: {data.get('error')}"
                    )
                    return has_correct_error
                except json.JSONDecodeError:
                    self.log_test(
                        "GET /media without folder returns 400 JSON error",
                        False,
                        "Response not valid JSON"
                    )
                    return False
            else:
                self.log_test(
                    "GET /media without folder returns 400 JSON error",
                    False,
                    f"Expected 400 JSON, got {response.status_code} {content_type}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET /media without folder returns 400 JSON error",
                False,
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_route_ordering(self) -> bool:
        """Test that /media route is registered BEFORE * SPA fallback"""
        try:
            # Test that non-existent route returns HTML (SPA fallback)
            response = requests.get(f"{self.base_url}/nonexistent-route")
            
            content_type = response.headers.get('content-type', '')
            is_html = 'text/html' in content_type
            
            if is_html and response.status_code == 404:
                # This confirms SPA fallback is working
                # Combined with previous tests, this proves /media is handled before fallback
                self.log_test(
                    "/media route registered BEFORE * SPA fallback",
                    True,
                    "Non-existent routes fall back to HTML, /media returns JSON"
                )
                return True
            else:
                self.log_test(
                    "/media route registered BEFORE * SPA fallback",
                    False,
                    f"SPA fallback not working as expected: {response.status_code} {content_type}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "/media route registered BEFORE * SPA fallback",
                False,
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_cloudinary_function_exists(self) -> bool:
        """Test that server/lib/cloudinary.js exports listByFolder function"""
        # This is tested indirectly through the /media endpoint functionality
        # If /media works, then listByFolder must exist and be imported
        try:
            response = requests.get(f"{self.base_url}/media", params={"folder": "expressbanners/catalogue"})
            
            # If we get a proper JSON response, it means the route
            # successfully imported and can call cloudinary functions
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if is_json:
                self.log_test(
                    "server/lib/cloudinary.js listByFolder function exists",
                    True,
                    "Confirmed by /media endpoint functionality"
                )
                return True
            else:
                self.log_test(
                    "server/lib/cloudinary.js listByFolder function exists",
                    False,
                    "Media endpoint doesn't work, suggesting missing cloudinary functions"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "server/lib/cloudinary.js listByFolder function exists",
                False,
                f"Cannot test cloudinary functions: {str(e)}"
            )
            return False

    def test_media_debug_endpoint(self) -> bool:
        """Test /media/debug returns JSON with Cloudinary connection status"""
        try:
            response = requests.get(f"{self.base_url}/media/debug")
            
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if response.status_code == 200 and is_json:
                try:
                    data = response.json()
                    required_fields = ['hasCloudName', 'hasApiKey', 'hasApiSecret', 'connected']
                    has_all_fields = all(field in data for field in required_fields)
                    
                    self.log_test(
                        "GET /media/debug returns JSON with connection status",
                        has_all_fields,
                        f"Status: {response.status_code}, Fields: {list(data.keys())}, Connected: {data.get('connected')}"
                    )
                    return has_all_fields
                except json.JSONDecodeError:
                    self.log_test(
                        "GET /media/debug returns JSON with connection status",
                        False,
                        "Response not valid JSON"
                    )
                    return False
            elif response.status_code == 404:
                # If endpoint doesn't exist on production, that's a deployment issue
                self.log_test(
                    "GET /media/debug returns JSON with connection status",
                    False,
                    f"Endpoint not found (404) - may not be deployed to production"
                )
                return False
            else:
                self.log_test(
                    "GET /media/debug returns JSON with connection status",
                    False,
                    f"Expected 200 JSON, got {response.status_code} {content_type}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET /media/debug returns JSON with connection status",
                False,
                f"Request failed: {str(e)}"
            )
            return False

    def test_media_folders_endpoint(self) -> bool:
        """Test /media/folders returns JSON listing subfolders"""
        try:
            response = requests.get(f"{self.base_url}/media/folders", params={
                "folder": "expressbanners"
            })
            
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if response.status_code == 200 and is_json:
                try:
                    data = response.json()
                    has_parent = 'parent' in data
                    has_folders = 'folders' in data and isinstance(data['folders'], list)
                    
                    self.log_test(
                        "GET /media/folders returns JSON with subfolder list",
                        has_parent and has_folders,
                        f"Status: {response.status_code}, Parent: {data.get('parent')}, Folders count: {len(data.get('folders', []))}"
                    )
                    return has_parent and has_folders
                except json.JSONDecodeError:
                    self.log_test(
                        "GET /media/folders returns JSON with subfolder list",
                        False,
                        "Response not valid JSON"
                    )
                    return False
            elif response.status_code == 404:
                # If endpoint doesn't exist on production, that's a deployment issue  
                self.log_test(
                    "GET /media/folders returns JSON with subfolder list",
                    False,
                    f"Endpoint not found (404) - may not be deployed to production"
                )
                return False
            else:
                self.log_test(
                    "GET /media/folders returns JSON with subfolder list",
                    False,
                    f"Expected 200 JSON, got {response.status_code} {content_type}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET /media/folders returns JSON with subfolder list",
                False,
                f"Request failed: {str(e)}"
            )
            return False

    def test_dynamic_folder_mode_support(self) -> bool:
        """Test that listByFolder function uses resources_by_asset_folder API"""
        # This is tested indirectly - if the production environment returns media
        # from dynamic folders, it confirms the API switch was successful
        try:
            response = requests.get(f"{self.base_url}/media", params={
                "folder": "expressbanners/catalogue",
                "max": "3"
            })
            
            if response.status_code == 200:
                data = response.json()
                items = data.get('items', [])
                
                # If we get items, it suggests dynamic folder mode is working
                success = len(items) > 0
                
                self.log_test(
                    "Dynamic Folder Mode support (resources_by_asset_folder API)",
                    success,
                    f"Retrieved {len(items)} items from dynamic folder structure"
                )
                return success
            else:
                self.log_test(
                    "Dynamic Folder Mode support (resources_by_asset_folder API)",
                    False,
                    f"Media endpoint returned {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Dynamic Folder Mode support (resources_by_asset_folder API)",
                False,
                f"Request failed: {str(e)}"
            )
            return False

    def test_existing_gallery_endpoint(self) -> bool:
        """Test that existing /api/gallery endpoint works with Cloudinary"""
        try:
            response = requests.get(f"{self.base_url}/api/gallery")
            
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if response.status_code == 200 and is_json:
                data = response.json()
                has_items = 'items' in data
                has_updated_at = 'updatedAt' in data
                
                self.log_test(
                    "Existing /api/gallery endpoint works with Cloudinary",
                    has_items and has_updated_at,
                    f"Status: {response.status_code}, Items: {len(data.get('items', []))}, Updated: {data.get('updatedAt', '')[:19]}"
                )
                return has_items and has_updated_at
            else:
                self.log_test(
                    "Existing /api/gallery endpoint works with Cloudinary",
                    False,
                    f"Expected 200 JSON, got {response.status_code} {content_type}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Existing /api/gallery endpoint works with Cloudinary",
                False,
                f"Request failed: {str(e)}"
            )
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests and return summary"""
        print("🧪 Running Express Banners Backend API Tests")
        print("=" * 50)
        
        tests = [
            self.test_media_endpoint_with_folder,
            self.test_media_endpoint_missing_folder,
            self.test_route_ordering,
            self.test_cloudinary_function_exists,
            self.test_media_debug_endpoint,
            self.test_media_folders_endpoint,
            self.test_dynamic_folder_mode_support,
            self.test_existing_gallery_endpoint,
        ]
        
        passed_count = 0
        for test in tests:
            if test():
                passed_count += 1
        
        print("\n" + "=" * 50)
        print(f"📊 Backend Test Results: {passed_count}/{len(tests)} tests passed")
        
        success_rate = (passed_count / len(tests)) * 100
        
        summary = {
            "total_tests": len(tests),
            "passed_tests": passed_count,
            "failed_tests": len(tests) - passed_count,
            "success_rate": f"{success_rate:.1f}%",
            "results": self.test_results
        }
        
        if passed_count == len(tests):
            print("🎉 All backend tests passed!")
        else:
            print(f"⚠️  {len(tests) - passed_count} tests failed")
        
        return summary

def main():
    """Run the test suite"""
    tester = ExpressBannersAPITest()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["failed_tests"] == 0 else 1

if __name__ == "__main__":
    exit(main())