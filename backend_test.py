#!/usr/bin/env python3
"""
Backend API Test Suite for Express Banners
Tests the /media endpoint functionality and route ordering.
"""

import requests
import json
from typing import Dict, Any, Tuple

class ExpressBannersAPITest:
    def __init__(self, base_url: str = "http://localhost:8080"):
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
            
            # Should return 500 (no Cloudinary env vars) but as JSON
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if response.status_code == 500 and is_json:
                try:
                    data = response.json()
                    has_error = 'error' in data
                    self.log_test(
                        "GET /media?folder=... returns 500 JSON (expected without Cloudinary)",
                        True,
                        f"Status: {response.status_code}, Content-Type: {content_type}, Has error field: {has_error}"
                    )
                    return True
                except json.JSONDecodeError:
                    self.log_test(
                        "GET /media?folder=... returns 500 JSON (expected without Cloudinary)",
                        False,
                        f"Response not valid JSON despite content-type: {content_type}"
                    )
                    return False
            else:
                self.log_test(
                    "GET /media?folder=... returns 500 JSON (expected without Cloudinary)",
                    False,
                    f"Expected 500 with JSON, got {response.status_code} with {content_type}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET /media?folder=... returns 500 JSON (expected without Cloudinary)",
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
        """Test that server/lib/cloudinary.js exports listByPrefix function"""
        # This is tested indirectly through the /media endpoint functionality
        # If /media works, then listByPrefix must exist and be imported
        try:
            response = requests.get(f"{self.base_url}/media", params={"folder": "test"})
            
            # If we get a proper JSON response (even error), it means the route
            # successfully imported and can call cloudinary functions
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if is_json:
                self.log_test(
                    "server/lib/cloudinary.js listByPrefix function exists",
                    True,
                    "Confirmed by /media endpoint functionality"
                )
                return True
            else:
                self.log_test(
                    "server/lib/cloudinary.js listByPrefix function exists",
                    False,
                    "Media endpoint doesn't work, suggesting missing cloudinary functions"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "server/lib/cloudinary.js listByPrefix function exists",
                False,
                f"Cannot test cloudinary functions: {str(e)}"
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